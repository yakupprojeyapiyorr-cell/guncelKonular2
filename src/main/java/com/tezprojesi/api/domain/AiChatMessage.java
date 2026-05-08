package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_chat_messages", indexes = {@Index(columnList = "user_id"), @Index(columnList = "topic_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String userMessage;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String aiResponse;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
