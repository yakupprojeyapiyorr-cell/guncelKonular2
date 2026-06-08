package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyPlanResponse {
    private UUID id;
    private LocalDate planDate;
    private String content;
    private Boolean isCompleted;
    private LocalDateTime createdAt;
}
