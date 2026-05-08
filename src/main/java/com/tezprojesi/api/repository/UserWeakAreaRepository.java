package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.UserWeakArea;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserWeakAreaRepository extends JpaRepository<UserWeakArea, UUID> {
    
    @Query("SELECT w FROM UserWeakArea w WHERE w.user.id = :userId ORDER BY w.successRate ASC")
    List<UserWeakArea> findByUserIdOrderBySuccessRate(@Param("userId") UUID userId);

    @Query("SELECT w FROM UserWeakArea w WHERE w.user.id = :userId AND w.topic.id = :topicId")
    Optional<UserWeakArea> findByUserIdAndTopicId(@Param("userId") UUID userId, @Param("topicId") UUID topicId);

    @Query("SELECT w FROM UserWeakArea w WHERE w.user.id = :userId AND w.successRate < :threshold ORDER BY w.successRate ASC")
    List<UserWeakArea> findCriticalWeakAreas(@Param("userId") UUID userId, @Param("threshold") Double threshold, Pageable pageable);

    @Query("SELECT w FROM UserWeakArea w WHERE w.user.id = :userId ORDER BY w.incorrectCount DESC")
    List<UserWeakArea> findByUserIdOrderByIncorrectCountDesc(@Param("userId") UUID userId, Pageable pageable);
}
