package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotBlank(message = "Görev başlığı boş olamaz")
    private String title;

    private String description;

    private String folderName;
    private java.util.UUID parentTaskId;
    private com.tezprojesi.api.domain.Priority priority;
    private com.tezprojesi.api.domain.Difficulty difficulty;
    private com.tezprojesi.api.domain.RecurrenceInterval recurrence;
    private com.tezprojesi.api.domain.Category category;
}
