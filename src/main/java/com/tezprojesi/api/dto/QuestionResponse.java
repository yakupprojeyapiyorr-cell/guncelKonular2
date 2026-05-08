package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    private UUID id;
    private UUID topicId;
    private String imageUrl;
    private String questionImageUrl; // Sorunun görseli (fotoğraf)
    // solutionImageUrl burada YOK — öğrenciye asla gönderilmez, sadece AI servisi DB'den okur
    private String questionText;
    private String difficulty;
    private BigDecimal coefficient;
    private Integer correctOption;
    private List<OptionResponse> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionResponse {
        private Integer index;
        private String text;
        private String whyText;
    }
}
