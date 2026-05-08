package com.tezprojesi.api.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DirectMessageResponse {
    private UUID id;
    private UUID senderId;
    private String senderName;
    private UUID receiverId;
    private String receiverName;
    private String content;
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
