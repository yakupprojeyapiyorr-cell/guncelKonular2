package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.*;
import com.tezprojesi.api.dto.BadgeResponse;
import com.tezprojesi.api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GamificationService {

    private final UserStreakRepository userStreakRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final TaskRepository taskRepository;
    private final BadgeService badgeService;

    public GamificationService(UserStreakRepository userStreakRepository, BadgeRepository badgeRepository,
                               UserBadgeRepository userBadgeRepository, UserRepository userRepository,
                               PomodoroSessionRepository pomodoroSessionRepository, TaskRepository taskRepository,
                               BadgeService badgeService) {
        this.userStreakRepository = userStreakRepository;
        this.badgeRepository = badgeRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.userRepository = userRepository;
        this.pomodoroSessionRepository = pomodoroSessionRepository;
        this.taskRepository = taskRepository;
        this.badgeService = badgeService;
    }

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

        // Check and unlock badges
        User user = userRepository.findById(userId).orElseThrow();
        badgeService.checkAndUnlockBadges(user);
    }

    @Transactional
    public void grantBadge(UUID userId, String badgeCode) {
        if (userBadgeRepository.existsByUserIdAndBadgeCode(userId, badgeCode)) {
            return;
        }

        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            User user = userRepository.findById(userId).orElseThrow();
            UserBadge userBadge = UserBadge.builder().user(user).badge(badge).unlocked(true).build();
            userBadgeRepository.save(userBadge);
        });
    }

    public UserStreak getStreak(UUID userId) {
        return userStreakRepository.findByUserId(userId).orElse(null);
    }

    public List<UserBadge> getUserBadges(UUID userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public List<BadgeResponse> getAllBadgesWithProgress(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        // Check and unlock badges (for legacy users who have old tasks)
        badgeService.checkAndUnlockBadges(user);
        return badgeService.getUserBadges(user);
    }
}
