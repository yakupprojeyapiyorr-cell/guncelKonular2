package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Goal;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.GoalCreateRequest;
import com.tezprojesi.api.dto.GoalResponse;
import com.tezprojesi.api.repository.GoalRepository;
import com.tezprojesi.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public GoalService(GoalRepository goalRepository, UserRepository userRepository) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
    }

    public List<GoalResponse> getActiveGoals(UUID userId) {
        LocalDate today = LocalDate.now();
        return goalRepository.findByUserIdAndIsCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(userId, today, today)
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

        goal = goalRepository.save(goal);
        return mapToResponse(goal);
    }

    @Transactional
    public void updateProgress(UUID userId, Goal.TargetType targetType, int increment) {
        LocalDate today = LocalDate.now();
        List<Goal> activeGoals = goalRepository.findByUserIdAndIsCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(userId, today, today);

        for (Goal goal : activeGoals) {
            if (goal.getTargetType() == targetType) {
                goal.setCurrentValue(goal.getCurrentValue() + increment);
                if (goal.getCurrentValue() >= goal.getTargetValue()) {
                    goal.setIsCompleted(true);
                }
            }
        }
        goalRepository.saveAll(activeGoals);
    }

    private GoalResponse mapToResponse(Goal goal) {
        double progress = (goal.getTargetValue() == 0) ? 0 : (goal.getCurrentValue() * 100.0) / goal.getTargetValue();
        return GoalResponse.builder()
                .id(goal.getId())
                .type(goal.getType())
                .targetType(goal.getTargetType())
                .targetValue(goal.getTargetValue())
                .currentValue(goal.getCurrentValue())
                .lessonName("Genel")
                .topicName("Tüm Konular")
                .startDate(goal.getStartDate())
                .endDate(goal.getEndDate())
                .isCompleted(goal.getIsCompleted())
                .progressPercentage(Math.min(100.0, progress))
                .build();
    }
}
