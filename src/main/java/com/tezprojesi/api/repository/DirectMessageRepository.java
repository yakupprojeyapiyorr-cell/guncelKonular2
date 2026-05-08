package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.DirectMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, UUID> {
    
    @Query("SELECT m FROM DirectMessage m WHERE " +
           "((m.sender.id = :userId AND m.receiver.id = :friendId) OR " +
           "(m.sender.id = :friendId AND m.receiver.id = :userId)) " +
           "ORDER BY m.createdAt DESC")
    List<DirectMessage> findConversation(@Param("userId") UUID userId, @Param("friendId") UUID friendId, Pageable pageable);

    @Query("SELECT m FROM DirectMessage m WHERE m.receiver.id = :userId AND m.isRead = false")
    List<DirectMessage> findUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadMessages(@Param("userId") UUID userId);

    @Query("SELECT COUNT(m) FROM DirectMessage m WHERE " +
           "m.receiver.id = :userId AND m.sender.id = :senderId AND m.isRead = false")
    long countUnreadFromSender(@Param("userId") UUID userId, @Param("senderId") UUID senderId);

    @Query("SELECT m FROM DirectMessage m WHERE " +
           "(m.sender.id = :userId OR m.receiver.id = :userId) " +
           "ORDER BY m.createdAt DESC")
    List<DirectMessage> findAllMessagesForUser(@Param("userId") UUID userId, Pageable pageable);

    @Query("UPDATE DirectMessage m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.receiver.id = :userId AND m.sender.id = :senderId AND m.isRead = false")
    void markAsReadFromSender(@Param("userId") UUID userId, @Param("senderId") UUID senderId);
}
