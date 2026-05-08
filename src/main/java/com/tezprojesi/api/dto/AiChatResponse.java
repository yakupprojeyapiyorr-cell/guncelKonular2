package com.tezprojesi.api.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatResponse {
    private UUID id;
    private String reply;
    private String source;
    private LocalDateTime createdAt;
}
