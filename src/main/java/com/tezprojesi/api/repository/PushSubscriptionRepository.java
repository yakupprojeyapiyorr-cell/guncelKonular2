package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.PushSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, UUID> {
    List<PushSubscription> findByUserIdAndIsActiveTrue(UUID userId);
}
