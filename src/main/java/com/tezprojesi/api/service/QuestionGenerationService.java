package com.tezprojesi.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tezprojesi.api.domain.GeneratedQuestion;
import com.tezprojesi.api.domain.QuestionTemplate;
import com.tezprojesi.api.domain.Topic;
import com.tezprojesi.api.dto.GeneratedQuestionResponse;
import com.tezprojesi.api.repository.GeneratedQuestionRepository;
import com.tezprojesi.api.repository.QuestionTemplateRepository;
import com.tezprojesi.api.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionGenerationService {

    private final AiService aiService;
    private final TopicRepository topicRepository;
    private final GeneratedQuestionRepository generatedQuestionRepository;
    private final QuestionTemplateRepository questionTemplateRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<GeneratedQuestionResponse> generateQuestionsByTopic(UUID topicId, String difficulty, int count) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found"));

        String systemPrompt = "Sen YKS sınavı hazırlayan profesyonel bir öğretmensin. Verilen konu hakkında özgün sorular üret.";
        String userPrompt = String.format(
                "Konu: %s\nZorluk: %s\nSoru Sayısı: %d\n" +
                "Her soru 5 şıklı olmalı. Yanıtı aşağıdaki JSON formatında ver:\n" +
                "{\"generatedQuestions\": [ {\"questionText\": \"...\", \"options\": {\"A\": \"...\", \"B\": \"...\", \"C\": \"...\", \"D\": \"...\", \"E\": \"...\"}, \"correctAnswer\": \"A\", \"explanation\": \"...\"} ]}",
                topic.getName(), difficulty, count);

        return processAiGeneration(systemPrompt, userPrompt, topic, difficulty);
    }

    @Transactional
    public List<GeneratedQuestionResponse> generateWithTemplate(UUID templateId, Map<String, String> variables) {
        QuestionTemplate template = questionTemplateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        String prompt = template.getTemplateText();
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            prompt = prompt.replace("{" + entry.getKey() + "}", entry.getValue());
        }

        // Logic to parse topics from variables if possible, or use default
        Topic topic = topicRepository.findAll().get(0); // Fallback to first topic for now

        return processAiGeneration("Sen bir soru üretim asistanısın.", prompt, topic, template.getDifficultyLevel());
    }

    private List<GeneratedQuestionResponse> processAiGeneration(String systemPrompt, String userPrompt, Topic topic, String difficulty) {
        try {
            String aiJson = aiService.generateResponse(systemPrompt, userPrompt);
            Map<String, Object> responseMap = objectMapper.readValue(aiJson, new TypeReference<>() {});
            
            if (responseMap.containsKey("error")) {
                throw new RuntimeException(responseMap.get("error").toString());
            }
            
            List<Map<String, Object>> questionsList = extractQuestionList(responseMap.get("generatedQuestions"));

            List<GeneratedQuestion> savedQuestions = questionsList.stream().map(q -> {
                GeneratedQuestion question = GeneratedQuestion.builder()
                        .topic(topic)
                        .questionText((String) q.get("questionText"))
                        .questionType(GeneratedQuestion.QuestionType.MULTIPLE_CHOICE)
                        .difficulty(GeneratedQuestion.Difficulty.valueOf(difficulty.toUpperCase()))
                        .options(extractOptions(q.get("options")))
                        .correctAnswer((String) q.get("correctAnswer"))
                        .explanation((String) q.get("explanation"))
                        .generatedBy("gpt-4-turbo-preview")
                        .generatedAt(LocalDateTime.now())
                        .isValidated(false)
                        .validationStatus(GeneratedQuestion.ValidationStatus.PENDING)
                        .usageCount(0)
                        .build();
                return generatedQuestionRepository.save(question);
            }).collect(Collectors.toList());

            return savedQuestions.stream().map(this::mapToResponse).collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("AI soru üretimi başarısız: " + e.getMessage());
        }
    }

    @Transactional
    public void validateGeneratedQuestion(UUID id, String feedback, boolean isApproved) {
        GeneratedQuestion question = generatedQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Generated question not found"));
        
        question.setValidated(true);
        question.setValidationStatus(isApproved ? GeneratedQuestion.ValidationStatus.APPROVED : GeneratedQuestion.ValidationStatus.REJECTED);
        // Feedback handling could be added to entity if needed
        generatedQuestionRepository.save(question);
    }

    public List<GeneratedQuestionResponse> getPendingQuestions() {
        return generatedQuestionRepository.findByValidationStatus(GeneratedQuestion.ValidationStatus.PENDING)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private List<Map<String, Object>> extractQuestionList(Object generatedQuestionsObject) {
        if (!(generatedQuestionsObject instanceof List<?> rawQuestions)) {
            throw new RuntimeException("AI response does not contain a valid generatedQuestions list");
        }

        List<Map<String, Object>> questions = new ArrayList<>();
        for (Object rawQuestion : rawQuestions) {
            if (!(rawQuestion instanceof Map<?, ?> rawQuestionMap)) {
                throw new RuntimeException("AI response contains an invalid question item");
            }
            questions.add(convertToStringObjectMap(rawQuestionMap));
        }
        return questions;
    }

    private Map<String, Object> extractOptions(Object optionsObject) {
        if (!(optionsObject instanceof Map<?, ?> rawOptions)) {
            throw new RuntimeException("AI response contains invalid options data");
        }
        return convertToStringObjectMap(rawOptions);
    }

    private Map<String, Object> convertToStringObjectMap(Map<?, ?> rawMap) {
        Map<String, Object> converted = new LinkedHashMap<>();
        rawMap.forEach((key, value) -> converted.put(String.valueOf(key), value));
        return converted;
    }

    private GeneratedQuestionResponse mapToResponse(GeneratedQuestion q) {
        return GeneratedQuestionResponse.builder()
                .id(q.getId())
                .topicId(q.getTopic().getId())
                .topicName(q.getTopic().getName())
                .questionText(q.getQuestionText())
                .options(q.getOptions())
                .difficulty(q.getDifficulty())
                .generatedBy(q.getGeneratedBy())
                .generatedAt(q.getGeneratedAt())
                .isValidated(q.isValidated())
                .validationStatus(q.getValidationStatus())
                .usageCount(q.getUsageCount())
                .rating(q.getRating())
                .explanation(q.getExplanation())
                .build();
    }
    public String generateStudyRecommendation(String topicName, double accuracyRate) {
        String systemPrompt = "Sen YKS koçusun. Öğrenciye özel çalışma tavsiyesi ver.";
        String userPrompt = String.format(
                "Öğrenci '%s' konusunda %%%.1f başarı oranına sahip. Kısa, motive edici ve teknik bir çalışma tavsiyesi ver (Max 150 karakter).",
                topicName, accuracyRate);
        try {
            return aiService.generateResponse(systemPrompt, userPrompt);
        } catch (Exception e) {
            return "Bu konuda biraz daha pratik yapmalısın. Özetleri tekrar gözden geçir.";
        }
    }
}
