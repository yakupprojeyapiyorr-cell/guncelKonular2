package com.tezprojesi.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long premiumUsers;
    private long totalTasks;
    private long totalPomodoroMinutes;
}
