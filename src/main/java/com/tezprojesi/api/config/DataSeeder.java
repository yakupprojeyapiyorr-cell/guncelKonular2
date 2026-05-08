package com.tezprojesi.api.config;

import com.tezprojesi.api.domain.User;
import com.tezprojesi.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@focusflow.com").isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .surname("Focus")
                    .email("admin@focusflow.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(User.UserRole.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user created: admin@focusflow.com / admin123");
        }

        if (userRepository.findByEmail("ogrenci@focusflow.com").isEmpty()) {
            User user = User.builder()
                    .name("Yakup")
                    .surname("Yılmaz")
                    .email("ogrenci@focusflow.com")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .role(User.UserRole.STUDENT)
                    .build();
            userRepository.save(user);
            System.out.println("Default student user created: ogrenci@focusflow.com / user123");
        }
    }
}
