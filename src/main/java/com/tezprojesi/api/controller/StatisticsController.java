package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.PomodoroTrendResponse;
import com.tezprojesi.api.dto.StatisticsResponse;
import com.tezprojesi.api.dto.WeakTopicResponse;
import com.tezprojesi.api.dto.LeaderboardResponse;
import com.tezprojesi.api.service.StatisticsService;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final UserRepository userRepository;
    private final UserStreakRepository userStreakRepository;

    @GetMapping("/me")
    public ResponseEntity<StatisticsResponse> getMyStats(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getStats(userId));
    }

    @GetMapping("/me/weak-topics")
    public ResponseEntity<List<WeakTopicResponse>> getWeakTopics(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getWeakTopics(userId));
    }

    @GetMapping("/me/pomodoro-trend")
    public ResponseEntity<List<PomodoroTrendResponse>> getPomodoroTrend(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getPomodoroTrend(userId));
    }

    @GetMapping("/me/categories")
    public ResponseEntity<List<com.tezprojesi.api.dto.CategoryDistributionResponse>> getCategoryDistribution(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(statisticsService.getCategoryDistribution(userId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, Object>> getLeaderboard(Authentication authentication) {
        UUID currentUserId = UUID.fromString(authentication.getPrincipal().toString());
        
        List<Object[]> top10Results = userRepository.findTop10ByTotalPomodoroMinutes();
        
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        int rank = 1;
        
        for (Object[] result : top10Results) {
            LeaderboardResponse response = LeaderboardResponse.builder()
                    .userId(UUID.fromString(result[0].toString()))
                    .userName(result[1] + " " + result[2])
                    .userEmail(result[3].toString())
                    .profilePictureUrl((String) result[4])
                    .totalPomodoroMinutes(((Number) result[5]).longValue())
                    .currentStreak(((Number) result[6]).intValue())
                    .rank(rank)
                    .isCurrentUser(currentUserId.equals(UUID.fromString(result[0].toString())))
                    .build();
            leaderboard.add(response);
            rank++;
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("leaderboard", leaderboard);
        response.put("currentUserRank", leaderboard.stream()
                .filter(LeaderboardResponse::getIsCurrentUser)
                .findFirst()
                .map(LeaderboardResponse::getRank)
                .orElse(0));

        return ResponseEntity.ok(response);
    }
}
