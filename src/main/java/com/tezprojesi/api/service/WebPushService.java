package com.tezprojesi.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tezprojesi.api.domain.PushSubscription;
import com.tezprojesi.api.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WebPushService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final ObjectMapper objectMapper;

    @Value("${vapid.public.key:}")
    private String publicKey;

    @Value("${vapid.private.key:}")
    private String privateKey;

    @Value("${vapid.subject:mailto:admin@focusflow.com}")
    private String subject;

    private PushService pushService;

    @PostConstruct
    public void init() {
        Security.addProvider(new BouncyCastleProvider());
        if (!publicKey.isEmpty() && !privateKey.isEmpty()) {
            try {
                pushService = new PushService(publicKey, privateKey, subject);
            } catch (Exception e) {
                System.err.println("Failed to initialize PushService: " + e.getMessage());
            }
        }
    }

    public void sendPush(UUID userId, String title, String body, String actionUrl) {
        if (pushService == null) return;

        List<PushSubscription> subscriptions = subscriptionRepository.findByUserIdAndIsActiveTrue(userId);
        
        Map<String, String> payload = Map.of(
            "title", title,
            "body", body,
            "url", actionUrl
        );

        for (PushSubscription sub : subscriptions) {
            try {
                Subscription subscription = new Subscription(
                    sub.getEndpoint(),
                    new Subscription.Keys(sub.getP256dhKey(), sub.getAuthKey())
                );

                Notification notification = new Notification(
                    subscription,
                    objectMapper.writeValueAsString(payload)
                );

                pushService.send(notification);
            } catch (Exception e) {
                // If push fails, we could deactivate the subscription
                System.err.println("Push failed for subscription: " + sub.getId());
            }
        }
    }
}
