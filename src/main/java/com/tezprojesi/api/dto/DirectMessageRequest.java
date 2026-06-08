package com.tezprojesi.api.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DirectMessageRequest {
    private UUID receiverId;
    private String content;
}
