package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.DirectMessage;
import com.tezprojesi.api.dto.DirectMessageRequest;
import com.tezprojesi.api.dto.DirectMessageResponse;
import com.tezprojesi.api.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin("*")
@RequiredArgsConstructor
public class DirectMessageController {
    
    private final DirectMessageService directMessageService;

    /**
     * Mesaj gönder
     */
    @PostMapping("/send")
    public ResponseEntity<DirectMessageResponse> sendMessage(
            @RequestBody DirectMessageRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        DirectMessage message = directMessageService.sendMessage(
                userId,
                request.getReceiverId(),
                request.getContent()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(message));
    }

    /**
     * Sohbet geçmişini getir
     */
    @GetMapping("/conversation/{friendId}")
    public ResponseEntity<List<DirectMessageResponse>> getConversation(
            @PathVariable UUID friendId,
            @RequestParam(defaultValue = "0") int page,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        List<DirectMessage> messages = directMessageService.getConversation(userId, friendId, page);
        List<DirectMessageResponse> responses = messages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Belirli arkadaşın mesajlarını okundu olarak işaretle
     */
    @PostMapping("/mark-read/{friendId}")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID friendId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        directMessageService.markAsReadFromFriend(userId, friendId);
        return ResponseEntity.ok().build();
    }

    /**
     * Okunmamış toplam mesaj sayısı
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        long unreadCount = directMessageService.getUnreadCount(userId);
        return ResponseEntity.ok(unreadCount);
    }

    /**
     * Belirli arkadaştan okunmamış mesaj sayısı
     */
    @GetMapping("/unread-from/{friendId}")
    public ResponseEntity<Long> getUnreadCountFromFriend(
            @PathVariable UUID friendId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        long count = directMessageService.getUnreadCountFromFriend(userId, friendId);
        return ResponseEntity.ok(count);
    }

    /**
     * Son sohbetleri getir (her arkadaşın en son mesajı)
     */
    @GetMapping("/recent")
    public ResponseEntity<List<DirectMessageResponse>> getRecentConversations(
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        List<DirectMessage> recentMessages = directMessageService.getRecentConversations(userId);
        List<DirectMessageResponse> responses = recentMessages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Mesajı sil
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable UUID messageId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        
        directMessageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    // Helper method
    private DirectMessageResponse toResponse(DirectMessage message) {
        return DirectMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .receiverId(message.getReceiver().getId())
                .receiverName(message.getReceiver().getName())
                .content(message.getContent())
                .isRead(message.isRead())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
