package com.tezprojesi.api.service;

import com.tezprojesi.api.dto.StatisticsResponse;
import com.tezprojesi.api.dto.WeakTopicResponse;
import com.tezprojesi.api.repository.ExamResultRepository;
import com.tezprojesi.api.repository.UserAnswerRepository;
import com.tezprojesi.api.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final ExamResultRepository examResultRepository;
    private final UserAnswerRepository userAnswerRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;

    public StatisticsResponse getStats(UUID userId) {
        var examResults = examResultRepository.findByUserId(userId);

        long totalQuestions = examResults.stream()
                .mapToInt(r -> r.getCorrectCount() + r.getWrongCount() + r.getBlankCount())
                .sum();

        long totalCorrect = examResults.stream()
                .mapToInt(r -> r.getCorrectCount())
                .sum();

        double correctPercentage = totalQuestions > 0 ? (totalCorrect * 100.0) / totalQuestions : 0;

        // Pomodoro stats
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        var pomodoroSessions = pomodoroSessionRepository.findByUserIdAndStartedAtBetween(
                userId, startOfToday, endOfToday);
        Integer totalMinutes = pomodoroSessions.stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                .sum();

        // Average net score
        double averageNetScore = examResults.isEmpty() ? 0 :
                examResults.stream()
                        .mapToDouble(r -> r.getNetScore().doubleValue())
                        .average()
                        .orElse(0);

        return StatisticsResponse.builder()
                .totalQuestions((int) totalQuestions)
                .totalCorrect((int) totalCorrect)
                .correctPercentage(correctPercentage)
                .totalExams(examResults.size())
                .averageNetScore(averageNetScore)
                .totalPomodoroMinutes(totalMinutes)
                .totalPomodoroHours(totalMinutes / 60.0)
                .build();
    }

    public List<WeakTopicResponse> getWeakTopics(UUID userId) {
        // This will be implemented with actual topic analysis
        // For now, returning empty list
        return List.of();
    }
}
