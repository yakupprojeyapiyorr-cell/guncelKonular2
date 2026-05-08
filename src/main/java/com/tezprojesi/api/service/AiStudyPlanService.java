package com.tezprojesi.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tezprojesi.api.domain.UserProfile;
import com.tezprojesi.api.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiStudyPlanService {

    private final AiService aiService;
    private final UserProfileRepository userProfileRepository;
    private final StatisticsService statisticsService;
    private final ObjectMapper objectMapper;

    public Map<String, Object> generateWeeklyPlan(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı profili bulunamadı. Lütfen onboarding'i tamamlayın."));

        var stats = statisticsService.getTopicStats(userId);

        String systemPrompt = "Sen profesyonel bir YKS koçusun. Öğrencinin verilerine göre haftalık program hazırla.";
        String userPrompt = String.format(
                "Öğrenci Hedefleri: TYT Net: %s, AYT Net: %s, Günlük Çalışma: %d saat.\n" +
                "Konu Başarı Analizi: %s\n" +
                "YKS'ye kalan süreyi ve zayıf konuları baz alarak 7 günlük program üret. " +
                "Yanıtı JSON formatında ver.",
                profile.getTargetTytNet(), profile.getTargetAytNet(), profile.getDailyStudyHours(), stats.toString());

        try {
            String aiJson = aiService.generateResponse(systemPrompt, userPrompt);
            Map<String, Object> responseMap = objectMapper.readValue(aiJson, new TypeReference<>() {});
            
            if (responseMap.containsKey("error")) {
                throw new RuntimeException(responseMap.get("error").toString());
            }
            
            return responseMap;
        } catch (Exception e) {
            throw new RuntimeException("AI çalışma planı üretilemedi: " + e.getMessage());
        }
    }
}
