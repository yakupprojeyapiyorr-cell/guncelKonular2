package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicStatisticsResponse {
    private UUID topicId;
    private String topicName;
    private int correctCount;
    private int wrongCount;
    private BigDecimal totalPoints;
}
