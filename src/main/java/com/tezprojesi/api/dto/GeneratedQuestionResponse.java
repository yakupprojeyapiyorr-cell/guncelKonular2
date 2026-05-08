package com.tezprojesi.api.dto;

import com.tezprojesi.api.domain.GeneratedQuestion;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedQuestionResponse {
    private UUID id;
    private UUID topicId;
    private String topicName;
    private String questionText;
    private Map<String, Object> options;
    private GeneratedQuestion.Difficulty difficulty;
    private String generatedBy;
    private LocalDateTime generatedAt;
    private boolean isValidated;
    private GeneratedQuestion.ValidationStatus validationStatus;
    private int usageCount;
    private Double rating;
    private String explanation;
}
