package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Badge;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.domain.UserBadge;
import com.tezprojesi.api.dto.BadgeResponse;
import com.tezprojesi.api.repository.BadgeRepository;
import com.tezprojesi.api.repository.TaskRepository;
import com.tezprojesi.api.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final TaskRepository taskRepository;

    // Badge unlock requirements
    private static final int FIRST_TASK_REQUIREMENT = 1;
    private static final int LEGEND_10_REQUIREMENT = 10;
    private static final int MASTER_50_REQUIREMENT = 50;
    private static final int LEGEND_100_REQUIREMENT = 100;
    private static final int IMMORTAL_150_REQUIREMENT = 150;

    public List<BadgeResponse> getUserBadges(User user) {
        long completedTaskCount = taskRepository.countByUserIdAndCompleted(user.getId(), true);

        List<Badge> allBadges = badgeRepository.findAll();

        return allBadges.stream()
                .map(badge -> {
                    UserBadge userBadge = userBadgeRepository
                            .findByUserIdAndBadgeId(user.getId(), badge.getId())
                            .orElse(null);

                    boolean isUnlocked = userBadge != null && userBadge.isUnlocked();
                    int requiredProgress = getRequiredProgress(badge.getCode());
                    double progressPercentage = (completedTaskCount * 100.0) / requiredProgress;

                    return BadgeResponse.builder()
                            .id(badge.getId())
                            .code(badge.getCode())
                            .name(badge.getName())
                            .description(badge.getDescription())
                            .iconUrl(badge.getIconUrl())
                            .isUnlocked(isUnlocked)
                            .currentProgress(Math.min(completedTaskCount, requiredProgress))
                            .requiredProgress(requiredProgress)
                            .progressPercentage(Math.min(progressPercentage, 100))
                            .unlockCondition(getUnlockCondition(badge.getCode()))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void checkAndUnlockBadges(User user) {
        long completedTaskCount = taskRepository.countByUserIdAndCompleted(user.getId(), true);

        List<Badge> allBadges = badgeRepository.findAll();

        for (Badge badge : allBadges) {
            boolean shouldBeUnlocked = shouldUnlock(badge.getCode(), completedTaskCount);

            UserBadge userBadge = userBadgeRepository
                    .findByUserIdAndBadgeId(user.getId(), badge.getId())
                    .orElseGet(() -> UserBadge.builder()
                            .user(user)
                            .badge(badge)
                            .unlocked(false)
                            .build());

            if (shouldBeUnlocked && !userBadge.isUnlocked()) {
                userBadge.setUnlocked(true);
                userBadgeRepository.save(userBadge);
            }
        }
    }

    private boolean shouldUnlock(String badgeCode, long completedTaskCount) {
        return switch (badgeCode) {
            case "FIRST_TASK" -> completedTaskCount >= FIRST_TASK_REQUIREMENT;
            case "TASK_LEGEND_10" -> completedTaskCount >= LEGEND_10_REQUIREMENT;
            case "TASK_MASTER_50" -> completedTaskCount >= MASTER_50_REQUIREMENT;
            case "TASK_LEGEND_100" -> completedTaskCount >= LEGEND_100_REQUIREMENT;
            case "TASK_IMMORTAL_150" -> completedTaskCount >= IMMORTAL_150_REQUIREMENT;
            default -> false;
        };
    }

    private int getRequiredProgress(String badgeCode) {
        return switch (badgeCode) {
            case "FIRST_TASK" -> FIRST_TASK_REQUIREMENT;
            case "TASK_LEGEND_10" -> LEGEND_10_REQUIREMENT;
            case "TASK_MASTER_50" -> MASTER_50_REQUIREMENT;
            case "TASK_LEGEND_100" -> LEGEND_100_REQUIREMENT;
            case "TASK_IMMORTAL_150" -> IMMORTAL_150_REQUIREMENT;
            default -> 0;
        };
    }

    private String getUnlockCondition(String badgeCode) {
        return switch (badgeCode) {
            case "FIRST_TASK" -> "1 görevi tamamla";
            case "TASK_LEGEND_10" -> "10 görevi tamamla";
            case "TASK_MASTER_50" -> "50 görevi tamamla";
            case "TASK_LEGEND_100" -> "100 görevi tamamla";
            case "TASK_IMMORTAL_150" -> "150 görevi tamamla";
            default -> "Bilinmeyen koşul";
        };
    }
}
