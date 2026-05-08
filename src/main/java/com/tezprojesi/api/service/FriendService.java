package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.Friend;
import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.FriendResponse;
import com.tezprojesi.api.repository.FriendRepository;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Arkadaş isteği gönder
     */
    public FriendResponse sendFriendRequest(UUID requesterUserId, UUID receiverUserId) {
        User requester = userRepository.findById(requesterUserId)
                .orElseThrow(() -> new RuntimeException("Requester not found"));
        User receiver = userRepository.findById(receiverUserId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Zaten arkadaş mı?
        friendRepository.findByRequesterAndReceiver(requester, receiver)
                .ifPresent(f -> {
                    if (f.getStatus() == Friend.FriendshipStatus.ACCEPTED) {
                        throw new RuntimeException("Already friends");
                    }
                });

        Friend friendship = Friend.builder()
                .requester(requester)
                .receiver(receiver)
                .status(Friend.FriendshipStatus.PENDING)
                .build();

        friendship = friendRepository.save(friendship);

        // Bildirim gönder
        notificationService.createNotification(receiverUserId, 
            com.tezprojesi.api.domain.Notification.NotificationType.FRIEND_REQUEST,
            "Yeni Arkadaş İsteği!", 
            requester.getName() + " sana arkadaşlık isteği gönderdi.", 
            "/friends");

        return mapToResponse(friendship);
    }

    /**
     * Arkadaş isteğini kabul et
     */
    public FriendResponse acceptFriendRequest(UUID friendshipId) {
        Friend friendship = friendRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship request not found"));

        friendship.setStatus(Friend.FriendshipStatus.ACCEPTED);
        friendship.setAcceptedAt(LocalDateTime.now());
        friendship = friendRepository.save(friendship);

        // Bildirim gönder (isteği gönderen kişiye kabul edildiğini haber ver)
        notificationService.createNotification(friendship.getRequester().getId(), 
            com.tezprojesi.api.domain.Notification.NotificationType.FRIEND_REQUEST,
            "İstek Kabul Edildi!", 
            friendship.getReceiver().getName() + " arkadaşlık isteğini kabul etti.", 
            "/friends");

        return mapToResponse(friendship);
    }

    /**
     * Arkadaş isteğini reddet/sil
     */
    public void rejectFriendRequest(UUID friendshipId) {
        friendRepository.deleteById(friendshipId);
    }

    /**
     * Arkadaş listesini getir
     */
    public List<FriendResponse> getFriends(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friend> friends = friendRepository.findFriendsOfUser(user);
        return friends.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Beklemede olan arkadaş isteklerini getir
     */
    public List<FriendResponse> getPendingRequests(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Friend> pending = friendRepository.findByReceiverAndStatus(user, Friend.FriendshipStatus.PENDING);
        return pending.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private FriendResponse mapToResponse(Friend friendship) {
        return FriendResponse.builder()
                .id(friendship.getId())
                .requesterId(friendship.getRequester().getId())
                .requesterName(friendship.getRequester().getName())
                .receiverId(friendship.getReceiver().getId())
                .receiverName(friendship.getReceiver().getName())
                .status(friendship.getStatus().toString())
                .createdAt(friendship.getCreatedAt())
                .acceptedAt(friendship.getAcceptedAt())
                .build();
    }
}
