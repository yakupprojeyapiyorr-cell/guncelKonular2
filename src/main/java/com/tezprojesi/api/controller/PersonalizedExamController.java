package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.PersonalizedExamResponse;
import com.tezprojesi.api.service.PersonalizedExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/exams/personalized")
@RequiredArgsConstructor
@CrossOrigin("*")
public class PersonalizedExamController {

    private final PersonalizedExamService personalizedExamService;

    @PostMapping("/generate")
    public ResponseEntity<PersonalizedExamResponse> generatePersonalizedExam(
            @RequestParam(defaultValue = "40") int totalQuestions,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        PersonalizedExamResponse response = personalizedExamService.generatePersonalizedExam(userId, totalQuestions);
        return ResponseEntity.ok(response);
    }
}
