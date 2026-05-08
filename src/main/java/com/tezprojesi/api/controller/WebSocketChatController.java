package com.tezprojesi.api.controller;

import com.tezprojesi.api.domain.DirectMessage;
import com.tezprojesi.api.service.DirectMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final DirectMessageService directMessageService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload Map<String, String> payload) {
        UUID senderId = UUID.fromString(payload.get("senderId"));
        UUID receiverId = UUID.fromString(payload.get("receiverId"));
        String content = payload.get("content");

        // Mesajı kaydet
        DirectMessage savedMessage = directMessageService.sendMessage(senderId, receiverId, content);

        // Alıcıya özel kanaldan gönder
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/messages",
                savedMessage
        );
        
        // Göndericiye de onayı gönder (isteğe bağlı)
        messagingTemplate.convertAndSendToUser(
                senderId.toString(),
                "/queue/messages",
                savedMessage
        );
    }
}
