package com.tezprojesi.api.dto;

import com.tezprojesi.api.domain.Notification.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID id;
    private NotificationType type;
    private String title;
    private String body;
    private String actionUrl;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
