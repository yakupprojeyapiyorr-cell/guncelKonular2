package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private Integer totalQuestions;
    private Integer totalCorrect;
    private Double correctPercentage;
    private Integer totalExams;
    private Double averageNetScore;
    private Integer totalPomodoroMinutes;
    private Double totalPomodoroHours;
}
