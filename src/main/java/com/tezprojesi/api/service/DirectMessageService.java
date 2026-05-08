package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.domain.DirectMessage;
import com.tezprojesi.api.domain.Friend;
import com.tezprojesi.api.repository.DirectMessageRepository;
import com.tezprojesi.api.repository.FriendRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DirectMessageService {
    
    private final DirectMessageRepository directMessageRepository;
    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final NotificationService notificationService;

    /**
     * Mesaj gönder
     */
    @Transactional
    public DirectMessage sendMessage(UUID senderId, UUID receiverId, String content) {
        // Doğrulama: Gönderici ve alıcı mevcut mi?
        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> receiverOpt = userRepository.findById(receiverId);
        
        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            throw new IllegalArgumentException("Gönderici veya alıcı bulunamadı");
        }

        // Doğrulama: Aralarında arkadaşlık var mı (opsiyonel - sıkı kontrol istemezseniz kaldırabilir)
        // Optional<Friend> friendship = friendRepository.findByRequesterAndReceiver(senderId, receiverId);
        // if (friendship.isEmpty() || friendship.get().getStatus() != Friend.FriendshipStatus.ACCEPTED) {
        //     throw new IllegalArgumentException("Arkadaşlık ilişkisi kurulu değil");
        // }

        DirectMessage message = DirectMessage.builder()
                .sender(senderOpt.get())
                .receiver(receiverOpt.get())
                .content(content)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        DirectMessage savedMessage = directMessageRepository.save(message);

        // Bildirim gönder
        notificationService.createNotification(receiverId, 
            com.tezprojesi.api.domain.Notification.NotificationType.SYSTEM_INFO,
            "Yeni Mesaj!", 
            senderOpt.get().getName() + ": " + content, 
            "/messages");

        return savedMessage;
    }

    /**
     * Sohbet geçmişini getir (sayfa başına 50 mesaj)
     */
    public List<DirectMessage> getConversation(UUID userId, UUID friendId, int page) {
        Pageable pageable = PageRequest.of(page, 50);
        return directMessageRepository.findConversation(userId, friendId, pageable);
    }

    /**
     * Belirli arkadaştan gelen mesajları okundu olarak işaretle
     */
    @Transactional
    public void markAsReadFromFriend(UUID userId, UUID friendId) {
        List<DirectMessage> unreadMessages = directMessageRepository.findUnreadMessages(userId)
                .stream()
                .filter(m -> m.getSender().getId().equals(friendId))
                .toList();

        for (DirectMessage message : unreadMessages) {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            directMessageRepository.save(message);
        }
    }

    /**
     * Okunmamış toplam mesaj sayısını getir
     */
    public long getUnreadCount(UUID userId) {
        return directMessageRepository.countUnreadMessages(userId);
    }

    /**
     * Belirli arkadaştan gelen okunmamış mesaj sayısı
     */
    public long getUnreadCountFromFriend(UUID userId, UUID friendId) {
        return directMessageRepository.countUnreadFromSender(userId, friendId);
    }

    /**
     * Son sohbetleri getir (her arkadaşın son mesajı)
     */
    public List<DirectMessage> getRecentConversations(UUID userId) {
        Pageable pageable = PageRequest.of(0, 100);
        List<DirectMessage> allMessages = directMessageRepository.findAllMessagesForUser(userId, pageable);
        
        // Her arkadaşın en son mesajını tuttuğumuz map oluştur
        return allMessages.stream()
                .collect(java.util.stream.Collectors.toMap(
                        m -> m.getSender().getId().equals(userId) ? m.getReceiver().getId() : m.getSender().getId(),
                        m -> m,
                        (existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt()) ? existing : replacement
                ))
                .values()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    /**
     * Mesajı sil (soft delete yerine hard delete - istenirse soft'a çevrilibilir)
     */
    @Transactional
    public void deleteMessage(UUID messageId, UUID userId) {
        Optional<DirectMessage> messageOpt = directMessageRepository.findById(messageId);
        
        if (messageOpt.isEmpty()) {
            throw new IllegalArgumentException("Mesaj bulunamadı");
        }

        DirectMessage message = messageOpt.get();
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("Sadece gönderici mesajı silebilir");
        }

        directMessageRepository.delete(message);
    }
}
