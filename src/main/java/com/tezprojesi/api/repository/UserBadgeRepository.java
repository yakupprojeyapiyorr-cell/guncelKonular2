package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, UUID> {
    List<UserBadge> findByUserId(UUID userId);
    boolean existsByUserIdAndBadgeCode(UUID userId, String code);
    Optional<UserBadge> findByUserIdAndBadgeId(UUID userId, UUID badgeId);
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO user_badges (id, user_id, badge_id, is_unlocked, earned_at) " +
                   "VALUES (?1, ?2, ?3, ?4, NOW()) " +
                   "ON CONFLICT (user_id, badge_id) DO UPDATE SET is_unlocked = EXCLUDED.is_unlocked", 
           nativeQuery = true)
    void upsertBadge(UUID id, UUID userId, UUID badgeId, boolean isUnlocked);
}
