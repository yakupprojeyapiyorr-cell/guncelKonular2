package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.TopicSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicSummaryRepository extends JpaRepository<TopicSummary, UUID> {
    Optional<TopicSummary> findByTopicId(UUID topicId);
}
