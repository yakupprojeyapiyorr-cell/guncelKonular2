package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    long countBySubscriptionType(User.SubscriptionType type);
    
    @Query(value = "SELECT u.id, u.name, u.surname, u.email, u.profile_picture_url, " +
            "COALESCE(SUM(ps.duration_minutes), 0) as total_minutes, " +
            "COALESCE(us.current_streak, 0) as current_streak " +
            "FROM users u " +
            "LEFT JOIN pomodoro_sessions ps ON u.id = ps.user_id " +
            "LEFT JOIN user_streaks us ON u.id = us.user_id " +
            "GROUP BY u.id, u.name, u.surname, u.email, u.profile_picture_url, us.current_streak " +
            "ORDER BY total_minutes DESC " +
            "LIMIT 10", nativeQuery = true)
    List<Object[]> findTop10ByTotalPomodoroMinutes();
}
