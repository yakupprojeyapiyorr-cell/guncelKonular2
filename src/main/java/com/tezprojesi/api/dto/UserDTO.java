package com.tezprojesi.api.dto;

import com.tezprojesi.api.domain.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserDTO {
    private UUID id;
    private String name;
    private String surname;
    private String email;
    private User.UserRole role;
    private User.SubscriptionType subscriptionType;
    private LocalDateTime createdAt;
}
