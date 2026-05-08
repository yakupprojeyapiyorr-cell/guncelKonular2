package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;
import com.tezprojesi.api.domain.User;

@Entity
@Table(name = "direct_messages", indexes = {
    @Index(name = "idx_sender_receiver", columnList = "sender_id, receiver_id"),
    @Index(name = "idx_receiver_unread", columnList = "receiver_id, is_read"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DirectMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
