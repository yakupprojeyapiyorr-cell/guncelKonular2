package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeakTopicResponse {
    private UUID topicId;
    private String topicName;
    private Integer wrongCount;
    private Double wrongPercentage;
}
