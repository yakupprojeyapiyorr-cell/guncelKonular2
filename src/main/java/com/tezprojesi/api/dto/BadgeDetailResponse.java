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
public class BadgeDetailResponse {
    private UUID badgeId;
    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private Boolean isUnlocked;
    private String unlockCondition;
    private Integer currentProgress;
    private Integer requiredProgress;
    private Double progressPercentage;
}
