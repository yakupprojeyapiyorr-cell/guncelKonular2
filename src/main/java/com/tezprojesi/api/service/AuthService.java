package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.dto.AuthRequest;
import com.tezprojesi.api.dto.AuthResponse;
import com.tezprojesi.api.repository.UserProfileRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        var role = request.getRole() != null ? 
                User.UserRole.valueOf(request.getRole().toUpperCase()) : 
                User.UserRole.STUDENT;

        var user = User.builder()
                .name(request.getName())
                .surname(request.getSurname())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .profilePictureUrl(request.getProfilePictureUrl())
                .role(role)
                .build();

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().toString());

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName() + " " + user.getSurname())
                .role(user.getRole().toString())
                .profilePictureUrl(user.getProfilePictureUrl())
                .token(token)
                .onboardingCompleted(false)
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + request.getEmail());
                    return new RuntimeException("User not found");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            System.out.println("Invalid password for: " + request.getEmail());
            throw new RuntimeException("Invalid password");
        }

        System.out.println("Login successful for: " + request.getEmail() + " with role: " + user.getRole());
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
                .build();
    }
}
