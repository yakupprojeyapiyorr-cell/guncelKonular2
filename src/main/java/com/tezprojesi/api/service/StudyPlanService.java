package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.StudyPlan;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.StudyPlanRequest;
import com.tezprojesi.api.dto.StudyPlanResponse;
import com.tezprojesi.api.repository.StudyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final NotificationService notificationService;

    public StudyPlanResponse createPlan(UUID userId, StudyPlanRequest request) {
        var plan = StudyPlan.builder()
                .user(User.builder().id(userId).build())
                .planDate(request.getPlanDate() != null ? request.getPlanDate() : LocalDate.now())
                .content(request.getContent())
                .isCompleted(false)
                .build();

        plan = studyPlanRepository.save(plan);
        return mapToResponse(plan);
    }

    public List<StudyPlanResponse> getPlansByDate(UUID userId, LocalDate date) {
        return studyPlanRepository.findByUserIdAndPlanDate(userId, date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StudyPlanResponse updatePlan(UUID planId, StudyPlanRequest request) {
        var plan = studyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        if (request.getContent() != null) {
            plan.setContent(request.getContent());
        }
        boolean wasCompleted = plan.getIsCompleted();
        if (request.getIsCompleted() != null) {
            plan.setIsCompleted(request.getIsCompleted());
        }

        plan = studyPlanRepository.save(plan);

        // Eğer plan yeni tamamlandıysa bildirim gönder
        if (!wasCompleted && plan.getIsCompleted()) {
            notificationService.createNotification(plan.getUser().getId(),
                com.tezprojesi.api.domain.Notification.NotificationType.GOAL_ACHIEVED,
                "Hedef Tamamlandı! 🎉",
                "Harika! '" + plan.getContent() + "' hedefini tamamladın.",
                "/plans");
        }
        return mapToResponse(plan);
    }

    public void deletePlan(UUID planId) {
        studyPlanRepository.deleteById(planId);
    }

    private StudyPlanResponse mapToResponse(StudyPlan plan) {
        return StudyPlanResponse.builder()
                .id(plan.getId())
                .planDate(plan.getPlanDate())
                .content(plan.getContent())
                .isCompleted(plan.getIsCompleted())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
