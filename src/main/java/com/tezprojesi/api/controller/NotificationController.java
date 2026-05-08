package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.PushSubscription;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.NotificationResponse;
import com.tezprojesi.api.repository.PushSubscriptionRepository;
import com.tezprojesi.api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final PushSubscriptionRepository subscriptionRepository;
    @GetMapping("/history")
    public ResponseEntity<List<NotificationResponse>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getNotifications(user.getId()));
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@AuthenticationPrincipal User user, @RequestBody Map<String, String> request) {
        PushSubscription sub = PushSubscription.builder()
                .user(user)
                .endpoint(request.get("endpoint"))
                .authKey(request.get("authKey"))
                .p256dhKey(request.get("p256dhKey"))
                .subscribedAt(LocalDateTime.now())
                .isActive(true)
                .build();
        subscriptionRepository.save(sub);
        return ResponseEntity.ok().build();
    }
}
