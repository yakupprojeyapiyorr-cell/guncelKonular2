package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.AiChatRequest;
import com.tezprojesi.api.dto.AiChatResponse;
import com.tezprojesi.api.service.RagChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai/chat")
@RequiredArgsConstructor
@CrossOrigin("*")
public class RagChatController {

    private final RagChatService ragChatService;

    @PostMapping
    public ResponseEntity<AiChatResponse> chat(
            @RequestBody AiChatRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        AiChatResponse response = ragChatService.chat(userId, request.getTopicId(), request.getMessage());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{topicId}")
    public ResponseEntity<List<Map<String, Object>>> getChatHistory(
            @PathVariable UUID topicId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        List<Map<String, Object>> history = ragChatService.getChatHistory(userId, topicId);
        return ResponseEntity.ok(history);
    }
}
