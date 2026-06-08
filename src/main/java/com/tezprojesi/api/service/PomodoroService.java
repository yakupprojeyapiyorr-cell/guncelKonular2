package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Goal;
import com.tezprojesi.api.domain.PomodoroSession;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.PomodoroSessionResponse;
import com.tezprojesi.api.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PomodoroService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final com.tezprojesi.api.repository.TaskRepository taskRepository;
    private final GamificationService gamificationService;
    private final GoalService goalService;

    public PomodoroSessionResponse startSession(UUID userId, UUID taskId, String categoryStr) {
        com.tezprojesi.api.domain.Category category = com.tezprojesi.api.domain.Category.OTHER;

        if (taskId != null) {
            category = taskRepository.findByIdAndUserId(taskId, userId)
                    .map(com.tezprojesi.api.domain.Task::getCategory)
                    .orElse(com.tezprojesi.api.domain.Category.OTHER);
        } else if (categoryStr != null && !categoryStr.isEmpty()) {
            try {
                category = com.tezprojesi.api.domain.Category.valueOf(categoryStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                category = com.tezprojesi.api.domain.Category.OTHER;
            }
        }

        var session = PomodoroSession.builder()
                .user(User.builder().id(userId).build())
                .taskId(taskId)
                .category(category)
                .durationMinutes(25)
                .startedAt(LocalDateTime.now())
                .build();

        session = pomodoroSessionRepository.save(session);
        return mapToResponse(session);
    }

    public PomodoroSessionResponse endSession(UUID userId, UUID sessionId, Integer durationMinutes) {
        var session = pomodoroSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setEndedAt(LocalDateTime.now());
        if (durationMinutes != null) {
            session.setDurationMinutes(durationMinutes);
        }
        session = pomodoroSessionRepository.save(session);

        gamificationService.updateStreak(session.getUser().getId());

        int minutes = session.getDurationMinutes() != null ? session.getDurationMinutes() : 0;
        if (minutes > 0) {
            goalService.updateProgress(userId, Goal.TargetType.STUDY_MINUTES, minutes);
        }

        return mapToResponse(session);
    }

    public List<PomodoroSessionResponse> getSessionsByDate(UUID userId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return pomodoroSessionRepository.findByUserIdAndStartedAtBetween(userId, startOfDay, endOfDay)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Integer getTotalMinutesForToday(UUID userId) {
        return getSessionsByDate(userId, LocalDate.now())
                .stream()
                .mapToInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                .sum();
    }

    private PomodoroSessionResponse mapToResponse(PomodoroSession session) {
        return PomodoroSessionResponse.builder()
                .id(session.getId())
                .taskId(session.getTaskId())
                .durationMinutes(session.getDurationMinutes())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .category(session.getCategory())
                .build();
    }
}
