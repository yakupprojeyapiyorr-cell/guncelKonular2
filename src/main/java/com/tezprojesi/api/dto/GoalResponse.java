package com.tezprojesi.api.dto;

import com.tezprojesi.api.domain.Goal.GoalType;
import com.tezprojesi.api.domain.Goal.TargetType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {
    private UUID id;
    private GoalType type;
    private TargetType targetType;
    private Integer targetValue;
    private Integer currentValue;
    private String lessonName;
    private String topicName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isCompleted;
    private Double progressPercentage;
}
