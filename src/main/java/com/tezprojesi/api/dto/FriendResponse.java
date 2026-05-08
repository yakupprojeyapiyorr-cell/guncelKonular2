package com.tezprojesi.api.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendResponse {
    private UUID id;
    private UUID requesterId;
    private String requesterName;
    private UUID receiverId;
    private String receiverName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;
}
