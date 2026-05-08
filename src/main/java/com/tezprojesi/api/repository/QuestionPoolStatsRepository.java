package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.QuestionPoolStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface QuestionPoolStatsRepository extends JpaRepository<QuestionPoolStats, UUID> {
}
