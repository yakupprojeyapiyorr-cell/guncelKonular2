package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultResponse {
    private UUID id;
    private UUID examId;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer blankCount;
    private BigDecimal netScore;
    private LocalDateTime completedAt;
}
