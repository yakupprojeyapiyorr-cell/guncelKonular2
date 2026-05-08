package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, UUID> {
    Page<AiChatMessage> findByUserIdAndTopicIdOrderByCreatedAtDesc(UUID userId, UUID topicId, Pageable pageable);
    List<AiChatMessage> findByUserIdAndTopicIdOrderByCreatedAtDesc(UUID userId, UUID topicId);
}
