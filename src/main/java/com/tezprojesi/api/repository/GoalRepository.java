package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findByUserIdAndIsCompletedFalseAndEndDateGreaterThanEqual(UUID userId, LocalDate date);
    List<Goal> findByUserIdAndIsCompletedFalseAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate
    );
    List<Goal> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
