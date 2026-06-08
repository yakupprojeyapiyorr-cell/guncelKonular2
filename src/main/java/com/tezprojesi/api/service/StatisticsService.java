package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Goal;
import com.tezprojesi.api.dto.PomodoroTrendResponse;
import com.tezprojesi.api.dto.StatisticsResponse;
import com.tezprojesi.api.dto.WeakTopicResponse;
import com.tezprojesi.api.repository.PomodoroSessionRepository;
import com.tezprojesi.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final TaskRepository taskRepository;

    public StatisticsResponse getStats(UUID userId) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        var pomodoroSessionsToday = pomodoroSessionRepository.findByUserIdAndStartedAtBetween(
                userId, startOfToday, endOfToday);
        int todayMinutes = pomodoroSessionsToday.stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                .sum();

        Long allTimeMinutes = pomodoroSessionRepository.sumDurationMinutesByUserId(userId);
        int totalMinutes = allTimeMinutes != null ? allTimeMinutes.intValue() : 0;

        long completedTasks = taskRepository.countByUserIdAndCompleted(userId, true);
        long pendingTasks = taskRepository.countByUserIdAndCompleted(userId, false);

        return StatisticsResponse.builder()
                .totalQuestions((int) completedTasks)
                .totalCorrect(0)
                .correctPercentage(0.0)
                .totalExams(0)
                .averageNetScore(0.0)
                .completedTasks((int) completedTasks)
                .pendingTasks((int) pendingTasks)
                .todayPomodoroMinutes(todayMinutes)
                .totalPomodoroMinutes(totalMinutes)
                .totalPomodoroHours(totalMinutes / 60.0)
                .topicStats(Collections.emptyList())
                .build();
    }

    public List<com.tezprojesi.api.dto.TopicStatisticsResponse> getTopicStats(UUID userId) {
        return Collections.emptyList();
    }

    public List<WeakTopicResponse> getWeakTopics(UUID userId) {
        return Collections.emptyList();
    }

    public List<PomodoroTrendResponse> getPomodoroTrend(UUID userId) {
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(6).atStartOfDay();
        var sessions = pomodoroSessionRepository.findByUserIdAndStartedAtBetween(
                userId, sevenDaysAgo, LocalDateTime.now());

        Map<LocalDate, Integer> minutesByDate = sessions.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getStartedAt().toLocalDate(),
                        Collectors.summingInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)));

        List<PomodoroTrendResponse> trend = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            trend.add(new PomodoroTrendResponse(date, minutesByDate.getOrDefault(date, 0)));
        }
        return trend;
    }

    public List<com.tezprojesi.api.dto.CategoryDistributionResponse> getCategoryDistribution(UUID userId) {
        List<Object[]> results = pomodoroSessionRepository.findCategoryDistributionByUserId(userId);
        
        List<com.tezprojesi.api.dto.CategoryDistributionResponse> distribution = new ArrayList<>();
        
        for (Object[] row : results) {
            com.tezprojesi.api.domain.Category category = (com.tezprojesi.api.domain.Category) row[0];
            Long minutes = ((Number) row[1]).longValue();
            
            String name;
            String color;
            switch (category) {
                case SOFTWARE:
                    name = "Yazılım";
                    color = "#6366f1"; // Indigo
                    break;
                case EDUCATION:
                    name = "Eğitim/Okul";
                    color = "#10b981"; // Emerald
                    break;
                case READING:
                    name = "Okuma";
                    color = "#f59e0b"; // Amber
                    break;
                case SPORT:
                    name = "Spor";
                    color = "#ef4444"; // Red
                    break;
                default:
                    name = "Diğer";
                    color = "#94a3b8"; // Slate
                    break;
            }
            
            distribution.add(com.tezprojesi.api.dto.CategoryDistributionResponse.builder()
                    .name(name)
                    .value(minutes)
                    .color(color)
                    .build());
        }
        
        return distribution;
    }
}
