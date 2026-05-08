package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Notification;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.NotificationResponse;
import com.tezprojesi.api.repository.NotificationRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebPushService webPushService;

    public List<NotificationResponse> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> n.setIsRead(true));
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(n -> n.setIsRead(true));
    }

    @Transactional
    public void createNotification(UUID userId, Notification.NotificationType type, String title, String body, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        notificationRepository.save(notification);

        // Send push notification
        webPushService.sendPush(userId, title, body, actionUrl);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .body(notification.getBody())
                .actionUrl(notification.getActionUrl())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
