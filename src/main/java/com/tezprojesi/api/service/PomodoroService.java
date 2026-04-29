package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.PomodoroSession;
import com.tezprojesi.api.domain.Topic;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.PomodoroSessionResponse;
import com.tezprojesi.api.repository.PomodoroSessionRepository;
import com.tezprojesi.api.repository.TopicRepository;
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
    private final TopicRepository topicRepository;

    public PomodoroSessionResponse startSession(UUID userId, UUID topicId) {
        var session = PomodoroSession.builder()
                .user(User.builder().id(userId).build())
                .topic(topicId != null ? Topic.builder().id(topicId).build() : null)
                .durationMinutes(25) // Default work session
                .startedAt(LocalDateTime.now())
                .build();

        session = pomodoroSessionRepository.save(session);
        return mapToResponse(session);
    }

    public PomodoroSessionResponse endSession(UUID sessionId, Integer durationMinutes) {
        var session = pomodoroSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        session.setEndedAt(LocalDateTime.now());
        if (durationMinutes != null) {
            session.setDurationMinutes(durationMinutes);
        }
        session = pomodoroSessionRepository.save(session);

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
                .topicId(session.getTopic() != null ? session.getTopic().getId() : null)
                .durationMinutes(session.getDurationMinutes())
                .startedAt(session.getStartedAt())
                .endedAt(session.getEndedAt())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
