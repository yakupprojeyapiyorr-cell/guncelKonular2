package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.Task;
import com.tezprojesi.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndCreatedAtAfter(User user, LocalDateTime date);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.completed = :completed")
    long countByUserIdAndCompleted(@Param("userId") UUID userId, @Param("completed") boolean completed);

    java.util.Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    List<Task> findByUserIdAndParentTaskId(UUID userId, UUID parentTaskId);
}
