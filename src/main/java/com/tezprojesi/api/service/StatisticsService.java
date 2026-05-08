package com.tezprojesi.api.service;

import com.tezprojesi.api.dto.PomodoroTrendResponse;
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
    private final QuestionGenerationService questionGenerationService;

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
                .topicStats(getTopicStats(userId))
                .build();
    }

    public List<com.tezprojesi.api.dto.TopicStatisticsResponse> getTopicStats(UUID userId) {
        var answers = userAnswerRepository.findByExamResultUserId(userId);
        
        return answers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestion().getTopic()))
                .entrySet().stream()
                .map(entry -> {
                    var topic = entry.getKey();
                    var topicAnswers = entry.getValue();
                    int correct = (int) topicAnswers.stream().filter(a -> a.getIsCorrect()).count();
                    int wrong = topicAnswers.size() - correct;
                    java.math.BigDecimal points = topicAnswers.stream()
                            .filter(a -> a.getIsCorrect())
                            .map(a -> a.getQuestion().getCoefficient())
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                    return com.tezprojesi.api.dto.TopicStatisticsResponse.builder()
                            .topicId(topic.getId())
                            .topicName(topic.getName())
                            .correctCount(correct)
                            .wrongCount(wrong)
                            .totalPoints(points)
                            .build();
                })
                .collect(Collectors.toList());
    }

    public List<WeakTopicResponse> getWeakTopics(UUID userId) {
        var stats = getTopicStats(userId);
        return stats.stream()
                .filter(s -> {
                    double total = s.getCorrectCount() + s.getWrongCount();
                    return total > 0 && (s.getCorrectCount() / total) < 0.6;
                })
                .map(s -> WeakTopicResponse.builder()
                        .topicId(s.getTopicId())
                        .topicName(s.getTopicName())
                        .accuracyRate((s.getCorrectCount() * 100.0) / (s.getCorrectCount() + s.getWrongCount()))
                        .recommendation(questionGenerationService.generateStudyRecommendation(s.getTopicName(), 
                            (s.getCorrectCount() * 100.0) / (s.getCorrectCount() + s.getWrongCount())))
                        .build())
                .collect(Collectors.toList());
    }

    public List<PomodoroTrendResponse> getPomodoroTrend(UUID userId) {
        LocalDateTime sevenDaysAgo = LocalDate.now().minusDays(7).atStartOfDay();
        var sessions = pomodoroSessionRepository.findByUserIdAndStartedAtBetween(
                userId, sevenDaysAgo, LocalDateTime.now());

        return sessions.stream()
                .collect(Collectors.groupingBy(s -> s.getStartedAt().toLocalDate(),
                        Collectors.summingInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)))
                .entrySet().stream()
                .map(entry -> new PomodoroTrendResponse(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }
}
