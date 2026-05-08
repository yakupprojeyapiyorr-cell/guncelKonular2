package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    List<PomodoroSession> findByUserIdAndStartedAtBetween(UUID userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
