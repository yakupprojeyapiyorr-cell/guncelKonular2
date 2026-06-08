package com.tezprojesi.api.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedQuestionRequest {
    private UUID topicId;
    private String difficulty; // EASY, MEDIUM, HARD
    private int count;
    private String preferredLanguage; // TR, EN
}
