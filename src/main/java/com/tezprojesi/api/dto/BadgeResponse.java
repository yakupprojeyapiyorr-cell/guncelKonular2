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
public class BadgeResponse {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private String iconUrl;
    private boolean isUnlocked;
    private long currentProgress;
    private long requiredProgress;
    private double progressPercentage;
    private String unlockCondition;
}
