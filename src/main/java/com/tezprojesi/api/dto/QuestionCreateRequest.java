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
public class QuestionCreateRequest {
    private UUID topicId;
    private String imageUrl;             // Legacy
    private String questionImageUrl;     // Sorunun fotoğrafı (tüm dersler)
    private String solutionImageUrl;     // Çözüm fotoğrafı (sadece sayısal, öğrenciye gizli)
    private String questionText;
    private String difficulty;
    private BigDecimal coefficient;
    private Integer correctOption;
    private List<OptionRequest> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionRequest {
        private Integer index;
        private String text;
        private String whyText;
    }
}
