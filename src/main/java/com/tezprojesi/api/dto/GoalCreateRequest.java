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
public class GoalCreateRequest {
    private GoalType type;
    private TargetType targetType;
    private Integer targetValue;
    private UUID lessonId;
    private UUID topicId;
    private LocalDate startDate;
    private LocalDate endDate;
}
