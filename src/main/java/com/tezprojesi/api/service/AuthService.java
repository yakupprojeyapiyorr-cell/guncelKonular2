package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.domain.UserProfile;
import com.tezprojesi.api.dto.AuthRequest;
import com.tezprojesi.api.dto.AuthResponse;
import com.tezprojesi.api.repository.UserProfileRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email zorunludur");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Sifre zorunludur");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Ad zorunludur");
        }
        if (request.getSurname() == null || request.getSurname().isBlank()) {
            throw new IllegalArgumentException("Soyad zorunludur");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User.UserRole role = User.UserRole.STUDENT;

        var user = User.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profilePictureUrl(request.getProfilePictureUrl())
                .role(role)
                .subscriptionType(User.SubscriptionType.FREE)
                .emailVerified(false)
                .verificationCode(generate6DigitCode())
                .build();

        user = userRepository.save(user);

        // Create default UserProfile for the newly registered user
        var userProfile = UserProfile.builder()
                .user(user)
                .examType("BOTH")
                .targetTytNet(80.0)
                .targetAytNet(60.0)
                .dailyStudyHours(6)
                .onboardingCompleted(false)
                .build();
        userProfileRepository.save(userProfile);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName() + " " + user.getSurname())
                .role(user.getRole().toString())
                .profilePictureUrl(user.getProfilePictureUrl())
                .token(token)
                .onboardingCompleted(false)
                .subscriptionType(user.getSubscriptionType().name())
                .emailVerified(false)
                .verificationCode(user.getVerificationCode())
                .build();
    }

    @Transactional
    public AuthResponse verifyEmail(String email, String code) {
        String normalizedEmail = email.trim().toLowerCase();
        var user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            throw new RuntimeException("E-posta zaten doğrulanmış");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Doğrulama kodu yanlış");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        boolean onboarded = userProfileRepository.findByUserId(user.getId())
                .map(p -> p.getOnboardingCompleted() != null && p.getOnboardingCompleted())
                .orElse(false);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName() + " " + user.getSurname())
                .role(user.getRole().toString())
                .profilePictureUrl(user.getProfilePictureUrl())
                .token(token)
                .onboardingCompleted(onboarded)
                .subscriptionType(user.getSubscriptionType().name())
                .emailVerified(true)
                .build();
    }

    private String generate6DigitCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public AuthResponse login(AuthRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email zorunludur");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Sifre zorunludur");
        }

        String email = request.getEmail().trim().toLowerCase();

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        boolean onboarded = userProfileRepository.findByUserId(user.getId())
                .map(p -> p.getOnboardingCompleted() != null && p.getOnboardingCompleted())
                .orElse(false);

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName() + " " + user.getSurname())
                .role(user.getRole().toString())
                .profilePictureUrl(user.getProfilePictureUrl())
                .token(token)
                .onboardingCompleted(onboarded)
                .subscriptionType(user.getSubscriptionType().name())
                .build();
    }

    @Transactional
    public void upgradePremium(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        user.setSubscriptionType(User.SubscriptionType.PREMIUM);
        userRepository.save(user);
    }
}
