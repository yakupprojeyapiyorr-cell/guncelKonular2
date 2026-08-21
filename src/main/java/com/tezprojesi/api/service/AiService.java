package com.tezprojesi.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    // OpenAI kaldırıldı — tüm AI çağrıları Gemini üzerinden yapılıyor

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final List<String> GEMINI_MODELS = List.of(
            "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash",
            "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-3.1-pro-preview");

    public String getProductivitySuggestion(int totalFocusMinutes, int tasksCompleted, int tasksPending) {
        String prompt = String.format(
                "Sen bir verimlilik asistanısın. Kullanıcı bugün toplam %d dakika odaklanarak çalıştı, " +
                        "%d görev tamamladı ve %d görevi henüz bekliyor. " +
                        "Ona Türkçe olarak kısa, motive edici ve bir sonraki adımı için akıllıca bir tavsiye ver. " +
                        "Sadece tavsiyeyi yaz, ekstra selamlaşma veya format kullanma.",
                totalFocusMinutes, tasksCompleted, tasksPending);
        return callGeminiWithFallback(prompt);
    }

    public String askAi(String userPrompt) {
        String systemInstruction = "Sen FocusFlow uygulamasının yapay zeka eğitim koçusun. "
                + "Kullanıcılara pomodoro, odaklanma ve zaman yönetimi konularında kısa, motive edici ve yapıcı tavsiyeler ver. "
                + "Yanıtların maksimum 3-4 cümle olsun. Kullanıcı sorusu: ";
        
        return callGeminiWithFallback(systemInstruction + userPrompt);
    }

    private boolean shouldTryNextModel(int status) {
        return List.of(408, 409, 425, 429, 500, 502, 503, 504, 404).contains(status);
    }

    private boolean shouldStopImmediately(int status) {
        return List.of(400, 401, 403, 422).contains(status);
    }

    private String callGeminiWithFallback(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return "Sistem: Yapay Zeka önerileri için Gemini API Key girilmedi. Lütfen ayarlarınızı kontrol edin.";
        }

        for (String model : GEMINI_MODELS) {
            try {
                return callGeminiApi(model, prompt);
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                int status = e.getStatusCode().value();
                System.err.println(
                        "[AI] Model: " + model + ", Status: " + status + ", ErrorText: " + e.getResponseBodyAsString());

                if (shouldStopImmediately(status)) {
                    return "Kritik API Hatası (" + status
                            + "): Lütfen ayarlarınızı veya API anahtarınızı kontrol edin.";
                }

                if (shouldTryNextModel(status)) {
                    System.out
                            .println("[AI] Model " + model + " için fallback tetiklendi. Sonraki modele geçiliyor...");
                    continue;
                }

                // Diğer her türlü bilinmeyen HTTP hatasında denemeye devam et
                continue;
            } catch (Exception e) {
                System.err.println("[AI] Model: " + model + ", Hata Türü: " + e.getClass().getSimpleName() + ", Mesaj: "
                        + e.getMessage());
                // I/O hataları, timeout vb. durumlarda da sıradaki modele geç
                continue;
            }
        }
        return "Tüm AI modellerinin kotaları dolmuş veya sorun yaşanıyor. Lütfen daha sonra deneyin.";
    }

    private String callGeminiApi(String model, String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key="
                + geminiApiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> requestBody = Map.of("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                url,
                entity,
                (Class<Map<String, Object>>) (Class<?>) Map.class);

        if (response.getBody() != null) {
            try {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                @SuppressWarnings("unchecked")
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                return (String) parts.get(0).get("text");
            } catch (Exception e) {
                return "AI Yanıtı okunamadı.";
            }
        }
        throw new RuntimeException("Boş yanıt geldi");
    }

    /**
     * System prompt + user prompt birleştirilerek Gemini'ye gönderilir.
     * AiStudyPlanService ve benzeri servisler bu metodu kullanır.
     */
    public String generateResponse(String systemPrompt, String userPrompt) {
        String combinedPrompt = systemPrompt + "\n\n" + userPrompt;
        return callGeminiWithFallback(combinedPrompt);
    }

    /**
     * JSON formatında yanıt döndürmesi için Gemini'ye prompt'a talimat eklenir.
     */
    public String generateJsonResponse(String systemPrompt, String userPrompt) {
        String jsonInstruction = systemPrompt
                + "\n\nÖNEMLİ: Yanıtını MUTLAKA geçerli bir JSON formatında ver. "
                + "Açıklama veya ek metin ekleme, sadece JSON döndür.\n\n";
        return callGeminiWithFallback(jsonInstruction + userPrompt);
    }

    public String generateMultimodalResponse(String systemPrompt, String userPrompt, List<String> imageUrls) {
        return generateResponse(systemPrompt, userPrompt);
    }
}
