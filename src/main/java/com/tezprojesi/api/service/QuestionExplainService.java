package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Question;
import com.tezprojesi.api.domain.QuestionOption;
import com.tezprojesi.api.domain.TopicSummary;
import com.tezprojesi.api.dto.QuestionExplainRequest;
import com.tezprojesi.api.dto.QuestionExplainResponse;
import com.tezprojesi.api.repository.QuestionRepository;
import com.tezprojesi.api.repository.TopicSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuestionExplainService {

    private final QuestionRepository questionRepository;
    private final TopicSummaryRepository topicSummaryRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key:}")
    private String apiKey;

    private static final String[] OPTION_KEYS = {"A", "B", "C", "D", "E"};

    public QuestionExplainResponse explain(QuestionExplainRequest request) {
        String questionContext = null;
        String solutionImageUrl = null;
        String topicSummary = null;
        String topicName = "Genel";
        String correctKey = null;
        String selectedKey = null;
        boolean hasScreenshot = false;
        boolean hasSummary = false;

        if (request.getQuestionId() != null) {
            Question q = questionRepository.findById(request.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Soru bulunamadi"));

            topicName = q.getTopic().getName();
            correctKey = q.getCorrectOption() != null ? OPTION_KEYS[q.getCorrectOption()] : null;
            selectedKey = request.getSelectedOption() != null
                    ? OPTION_KEYS[Math.min(request.getSelectedOption(), 4)] : null;

            List<QuestionOption> opts = q.getOptions();
            if (opts != null) {
                opts.sort(Comparator.comparingInt(QuestionOption::getOptionIndex));
            }

            StringBuilder optsText = new StringBuilder();
            if (opts != null) {
                for (QuestionOption o : opts) {
                    optsText.append(OPTION_KEYS[o.getOptionIndex()])
                            .append(") ")
                            .append(o.getOptionText())
                            .append("\n");
                }
            }

            questionContext = String.format("""
                    Soru: %s

                    Siklar:
                    %s
                    %s%s
                    """,
                    q.getQuestionText() != null ? q.getQuestionText() : "(Fotograftan okundu)",
                    optsText,
                    correctKey != null ? "Dogru Cevap: " + correctKey + "\n" : "",
                    selectedKey != null ? "Ogrencinin Secimi: " + selectedKey : "");

            solutionImageUrl = q.getSolutionImageUrl();
            hasScreenshot = solutionImageUrl != null && !solutionImageUrl.isBlank();

            Optional<TopicSummary> summary = topicSummaryRepository.findByTopicId(q.getTopic().getId());
            if (summary.isPresent() && summary.get().getContentMarkdown() != null) {
                topicSummary = summary.get().getContentMarkdown();
                hasSummary = true;
            }
        }

        String systemPrompt = buildSystemPrompt(topicName, topicSummary, hasSummary);
        String followUp = request.getFollowUpQuestion();
        String userText = buildUserText(questionContext, followUp);

        List<String> imageUrls = new ArrayList<>();
        if (hasScreenshot) {
            imageUrls.add(solutionImageUrl);
        }
        if (request.getStudentImageUrl() != null && !request.getStudentImageUrl().isBlank()) {
            imageUrls.add(request.getStudentImageUrl());
        }

        String explanation = callOpenAI(systemPrompt, userText, imageUrls);

        return QuestionExplainResponse.builder()
                .explanation(explanation)
                .correctAnswerKey(correctKey)
                .topicName(topicName)
                .screenshotUrl(null)
                .hasScreenshot(hasScreenshot)
                .hasSummary(hasSummary)
                .build();
    }

    private String buildSystemPrompt(String topicName, String summary, boolean hasSummary) {
        String base = """
                Sen FocusFlow YKS platformunun kisisel AI ogretmenisin.
                Ogrenciye Turkce, sicak ve motive edici bir dille aciklama yapiyorsun.
                Cevaplarin net, adim adim ve anlasilir olsun.
                Emoji kullanabilirsin ama abartma.

                ONEMLI: Eger sana bir gorsel gonderildiyse, gorseli dogal bir sekilde degerlendir.
                "Gorselde goruldugu uzere" veya "fotografta" gibi ifadeler kullanma.
                """;

        if (hasSummary) {
            return base + String.format("""

                    --- %s KONUSU HAKKINDA EK BAGLAM ---
                    %s
                    ------------------------------------

                    Bu ozeti yol gosterici olarak kullan. Ozette olmayan ama bildigin seyleri de aciklayabilirsin.
                    Ama ozetle celisme. Ogrencinin konuyu tam anlamasini sagla.
                    """, topicName, summary);
        }

        return base + String.format("""

                Konu: %s
                Bu konuda genel YKS bilginle aciklama yap.
                """, topicName);
    }

    private String buildUserText(String questionContext, String followUp) {
        StringBuilder sb = new StringBuilder();

        if (questionContext != null) {
            sb.append(questionContext).append("\n");
        }

        if (followUp != null && !followUp.isBlank()) {
            sb.append("Sorum: ").append(followUp);
        } else if (questionContext != null) {
            sb.append("Bu soruyu anlayamadim. Adim adim aciklar misin?");
        } else {
            sb.append(followUp != null ? followUp : "Lutfen yardim et.");
        }

        return sb.toString();
    }

    private String callOpenAI(String systemPrompt, String userText, List<String> imageUrls) {
        if (apiKey == null || apiKey.isBlank()) {
            return "OpenAI API anahtari tanimli degil. Lutfen .env dosyasina OPENAI_API_KEY ekle.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Object userContent;
        if (imageUrls.isEmpty()) {
            userContent = userText;
        } else {
            List<Map<String, Object>> contentList = new ArrayList<>();
            contentList.add(Map.of("type", "text", "text", userText));
            for (String imgUrl : imageUrls) {
                contentList.add(Map.of(
                        "type", "image_url",
                        "image_url", Map.of("url", imgUrl, "detail", "high")
                ));
            }
            userContent = contentList;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o");
        body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userContent)
        ));
        body.put("max_tokens", 1500);
        body.put("temperature", 0.5);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Object choicesObject = response.getBody().get("choices");
                if (choicesObject instanceof List<?> choices && !choices.isEmpty()) {
                    Object firstChoice = choices.get(0);
                    if (firstChoice instanceof Map<?, ?> choiceMap) {
                        Object message = choiceMap.get("message");
                        if (message instanceof Map<?, ?> messageMap) {
                            Object content = messageMap.get("content");
                            if (content instanceof String contentText) {
                                return contentText;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            return "AI aciklamasi alinamadi: " + e.getMessage();
        }

        return "Beklenmedik bir hata olustu.";
    }
}
