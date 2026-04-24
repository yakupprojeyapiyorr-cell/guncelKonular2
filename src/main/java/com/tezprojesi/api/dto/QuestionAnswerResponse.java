package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionAnswerResponse {
    private Boolean isCorrect;
    private Integer correctOption;
    private BigDecimal pointsEarned;
    private String generalExplanation;
    private List<OptionExplanation> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionExplanation {
        private Integer index;
        private String text;
        private String whyText;
    }
}
