package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private boolean completed;
    private String folderName;
    private UUID parentTaskId;
    private com.tezprojesi.api.domain.Priority priority;
    private com.tezprojesi.api.domain.Difficulty difficulty;
    private com.tezprojesi.api.domain.RecurrenceInterval recurrence;
    private com.tezprojesi.api.domain.Category category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
