package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.VideoProgressRequest;
import com.tezprojesi.api.service.VideoProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/video-progress")
@RequiredArgsConstructor
@CrossOrigin("*")
public class VideoProgressController {

    private final VideoProgressService videoProgressService;

    @PostMapping
    public ResponseEntity<Void> saveProgress(
            @RequestBody VideoProgressRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        videoProgressService.saveProgress(userId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{playlistId}")
    public ResponseEntity<List<String>> getWatchedVideos(
            @PathVariable UUID playlistId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        return ResponseEntity.ok(videoProgressService.getWatchedVideoIds(userId, playlistId));
    }
}
