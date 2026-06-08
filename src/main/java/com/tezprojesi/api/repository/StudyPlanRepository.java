package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudyPlanRepository extends JpaRepository<StudyPlan, UUID> {
    List<StudyPlan> findByUserIdAndPlanDate(UUID userId, LocalDate date);
}
