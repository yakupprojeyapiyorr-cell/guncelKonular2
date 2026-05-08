package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Goal;
import com.tezprojesi.api.domain.Notification;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.GoalCreateRequest;
import com.tezprojesi.api.dto.GoalResponse;
import com.tezprojesi.api.repository.GoalRepository;
import com.tezprojesi.api.repository.LessonRepository;
import com.tezprojesi.api.repository.TopicRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;
    private final NotificationService notificationService;

    public List<GoalResponse> getActiveGoals(UUID userId) {
        return goalRepository.findByUserIdAndIsCompletedFalseAndEndDateGreaterThanEqual(userId, LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GoalResponse> getAllGoals(UUID userId) {
        return goalRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse createGoal(UUID userId, GoalCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Goal goal = Goal.builder()
                .user(user)
                .type(request.getType())
                .targetType(request.getTargetType())
                .targetValue(request.getTargetValue())
                .currentValue(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isCompleted(false)
                .build();

        if (request.getLessonId() != null) {
            goal.setLesson(lessonRepository.findById(request.getLessonId()).orElse(null));
        }
        if (request.getTopicId() != null) {
            goal.setTopic(topicRepository.findById(request.getTopicId()).orElse(null));
        }

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void updateProgress(UUID userId, Goal.TargetType targetType, int increment, UUID lessonId, UUID topicId) {
        List<Goal> activeGoals = goalRepository.findByUserIdAndIsCompletedFalseAndEndDateGreaterThanEqual(userId, LocalDate.now());

        for (Goal goal : activeGoals) {
            if (goal.getTargetType() == targetType) {
                // Check if goal is specific to a lesson or topic
                boolean match = true;
                if (goal.getLesson() != null && !goal.getLesson().getId().equals(lessonId)) match = false;
                if (goal.getTopic() != null && !goal.getTopic().getId().equals(topicId)) match = false;

                if (match) {
                    goal.setCurrentValue(goal.getCurrentValue() + increment);
                    if (goal.getCurrentValue() >= goal.getTargetValue()) {
                        goal.setIsCompleted(true);
                        notificationService.createNotification(userId, Notification.NotificationType.GOAL_ACHIEVED, 
                                "Tebrikler! Hedefe ulaşıldı.", 
                                "Hedefine ulaştın: " + goal.getTargetValue() + " " + goal.getTargetType(),
                                "/plans");
                    }
                }
            }
        }
        goalRepository.saveAll(activeGoals);
    }

    private GoalResponse mapToResponse(Goal goal) {
        double progress = (goal.getCurrentValue() * 100.0) / goal.getTargetValue();
        return GoalResponse.builder()
                .id(goal.getId())
                .type(goal.getType())
                .targetType(goal.getTargetType())
                .targetValue(goal.getTargetValue())
                .currentValue(goal.getCurrentValue())
                .lessonName(goal.getLesson() != null ? goal.getLesson().getName() : "Tüm Dersler")
                .topicName(goal.getTopic() != null ? goal.getTopic().getName() : "Tüm Konular")
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .isCompleted(goal.getIsCompleted())
                .progressPercentage(Math.min(100.0, progress))
                .build();
    }
}
