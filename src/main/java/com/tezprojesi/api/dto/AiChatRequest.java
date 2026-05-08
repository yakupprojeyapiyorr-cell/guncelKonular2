package com.tezprojesi.api.dto;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatRequest {
    private UUID topicId;
    private String message;
}
