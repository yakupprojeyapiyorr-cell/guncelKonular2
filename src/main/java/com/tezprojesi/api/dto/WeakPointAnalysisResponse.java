package com.tezprojesi.api.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeakPointAnalysisResponse {
    private String summary;
    private List<WeakTopic> weakTopics;
    private String positiveReinforcement;
    private LocalDateTime generatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WeakTopic {
        private UUID topicId;
        private String topicName;
        private Integer successRate;
        private Integer attemptCount;
        private String hypothesis;
        private List<String> actionPlan;
        private String recommendation;
    }
}
