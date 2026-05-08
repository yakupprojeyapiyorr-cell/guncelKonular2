package com.tezprojesi.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tezprojesi.api.domain.Topic;
import com.tezprojesi.api.dto.QuestionCreateRequest;
import com.tezprojesi.api.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiQuestionService {

    private final AiService aiService;
    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper;

    public List<QuestionCreateRequest> generateQuestions(UUID topicId, String difficulty, int count) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        String systemPrompt = "Sen YKS sinavi hazirlayan bir ogretmensin. Verilen konu hakkinda ozgun sorular uret.";
        String userPrompt = String.format(
                "Konu: %s\nZorluk: %s\nSoru Sayisi: %d\n" +
                        "Her soru 5 sikli olmali. Cozum aciklamasi adim adim olmali. " +
                        "Yaniti asagidaki JSON formatinda ver:\n" +
                        "{\"generatedQuestions\": [ {\"questionText\": \"...\", \"options\": [{\"index\": 0, \"text\": \"...\", \"whyText\": \"...\"}, ...], \"correctOption\": 0, \"difficulty\": \"%s\", \"coefficient\": 1.0} ]}",
                topic.getName(), difficulty, count, difficulty);

        try {
            String aiJson = aiService.generateResponse(systemPrompt, userPrompt);
            Map<String, Object> responseMap = objectMapper.readValue(aiJson, new TypeReference<>() {});

            if (responseMap.containsKey("error")) {
                throw new RuntimeException(responseMap.get("error").toString());
            }

            List<Map<String, Object>> questionsList = extractObjectList(responseMap.get("generatedQuestions"));

            return questionsList.stream().map(q -> {
                List<Map<String, Object>> optionsList = extractObjectList(q.get("options"));
                List<QuestionCreateRequest.OptionRequest> options = optionsList.stream()
                        .map(o -> QuestionCreateRequest.OptionRequest.builder()
                                .index((Integer) o.get("index"))
                                .text((String) o.get("text"))
                                .whyText((String) o.get("whyText"))
                                .build())
                        .collect(Collectors.toList());

                return QuestionCreateRequest.builder()
                        .topicId(topicId)
                        .questionText((String) q.get("questionText"))
                        .difficulty((String) q.get("difficulty"))
                        .coefficient(new BigDecimal(q.get("coefficient").toString()))
                        .correctOption((Integer) q.get("correctOption"))
                        .options(options)
                        .build();
            }).collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("AI soru uretimi basarisiz: " + e.getMessage());
        }
    }

    private List<Map<String, Object>> extractObjectList(Object rawListObject) {
        if (!(rawListObject instanceof List<?> rawList)) {
            throw new RuntimeException("AI response contains an invalid list structure");
        }

        return rawList.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    private Map<String, Object> convertToMap(Object rawItem) {
        if (!(rawItem instanceof Map<?, ?> rawMap)) {
            throw new RuntimeException("AI response contains an invalid item");
        }

        return rawMap.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> String.valueOf(entry.getKey()),
                        Map.Entry::getValue
                ));
    }
}
