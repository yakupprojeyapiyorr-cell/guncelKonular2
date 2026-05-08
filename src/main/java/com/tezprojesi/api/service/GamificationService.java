package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.*;
import com.tezprojesi.api.repository.BadgeRepository;
import com.tezprojesi.api.repository.UserBadgeRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserStreakRepository userStreakRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void updateStreak(UUID userId) {
        UserStreak streak = userStreakRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    return UserStreak.builder().user(user).currentStreak(0).longestStreak(0).build();
                });

        LocalDate today = LocalDate.now();
        if (streak.getLastActiveDate() == null) {
            streak.setCurrentStreak(1);
        } else if (streak.getLastActiveDate().equals(today.minusDays(1))) {
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else if (!streak.getLastActiveDate().equals(today)) {
            streak.setCurrentStreak(1);
        }

        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        streak.setLastActiveDate(today);
        userStreakRepository.save(streak);

        // Check for streak badges
        checkStreakBadges(userId, streak.getCurrentStreak());
    }

    @Transactional
    public void grantBadge(UUID userId, String badgeCode) {
        if (userBadgeRepository.existsByUserIdAndBadgeCode(userId, badgeCode)) {
            return;
        }

        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            User user = userRepository.findById(userId).orElseThrow();
            UserBadge userBadge = UserBadge.builder().user(user).badge(badge).build();
            userBadgeRepository.save(userBadge);

            notificationService.createNotification(userId, Notification.NotificationType.GOAL_ACHIEVED,
                    "Yeni Rozet!", "Yeni bir rozet kazandın: " + badge.getName(), "/profile");
        });
    }

    private void checkStreakBadges(UUID userId, int currentStreak) {
        if (currentStreak >= 7) grantBadge(userId, "STREAK_7");
        if (currentStreak >= 30) grantBadge(userId, "STREAK_30");
    }

    public UserStreak getStreak(UUID userId) {
        return userStreakRepository.findByUserId(userId).orElse(null);
    }

    public List<UserBadge> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId);
    }
}
