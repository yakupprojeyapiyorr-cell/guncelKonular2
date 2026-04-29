package com.tezprojesi.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicRequest {
    @NotBlank(message = "Konu adı boş olamaz")
    private String name;
    
    @NotNull(message = "Ders ID boş olamaz")
    private UUID lessonId;
    
    private Integer orderIndex;
}
