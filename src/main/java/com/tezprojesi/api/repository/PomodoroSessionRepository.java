package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    List<PomodoroSession> findByUserIdAndStartedAtBetween(UUID userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
    java.util.Optional<PomodoroSession> findByIdAndUserId(UUID id, UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.durationMinutes) FROM PomodoroSession p")
    Long sumAllDurations();
    
    @Query("SELECT SUM(p.durationMinutes) FROM PomodoroSession p WHERE p.user.id = :userId")
    Long sumDurationMinutesByUserId(@Param("userId") UUID userId);

    @Query("SELECT p.category, SUM(p.durationMinutes) FROM PomodoroSession p WHERE p.user.id = :userId AND p.category IS NOT NULL GROUP BY p.category")
    List<Object[]> findCategoryDistributionByUserId(@Param("userId") UUID userId);
}
