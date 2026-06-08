package com.tezprojesi.api.dto;

import lombok.*;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalizedExamResponse {
    private UUID examId;
    private String examName;
    private Integer totalQuestions;
    private Map<String, Integer> questionDistribution;
}
