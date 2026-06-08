package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.UserScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserScoreRepository extends JpaRepository<UserScore, UUID> {
    Optional<UserScore> findByUserId(UUID userId);
    Page<UserScore> findAllByOrderByTotalScoreDesc(Pageable pageable);
}
