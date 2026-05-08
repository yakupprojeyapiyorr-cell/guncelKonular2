package com.tezprojesi.api.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserScoreResponse {
    private UUID userId;
    private String userName;
    private BigDecimal totalScore;
    private Integer examCount;
    private BigDecimal averageScore;
    private Integer correctCount;
    private Integer wrongCount;
    private Double accuracy;
}
