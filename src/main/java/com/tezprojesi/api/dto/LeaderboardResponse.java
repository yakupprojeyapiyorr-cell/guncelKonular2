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
public class LeaderboardResponse {
    private UUID userId;
    private String userName;
    private String userEmail;
    private Long totalPomodoroMinutes;
    private Integer rank;
    private String profilePictureUrl;
    private Integer currentStreak;
    private Boolean isCurrentUser;
}
