package com.tezprojesi.api.controller;

import com.tezprojesi.api.dto.FriendResponse;
import com.tezprojesi.api.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@CrossOrigin("*")
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<FriendResponse> sendFriendRequest(
            @PathVariable UUID receiverId,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        FriendResponse response = friendService.sendFriendRequest(userId, receiverId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<FriendResponse> acceptFriendRequest(
            @PathVariable UUID friendshipId) {
        FriendResponse response = friendService.acceptFriendRequest(friendshipId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<Void> rejectFriendRequest(
            @PathVariable UUID friendshipId) {
        friendService.rejectFriendRequest(friendshipId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/list")
    public ResponseEntity<List<FriendResponse>> getFriends(
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        List<FriendResponse> friends = friendService.getFriends(userId);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendResponse>> getPendingRequests(
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getPrincipal().toString());
        List<FriendResponse> pending = friendService.getPendingRequests(userId);
        return ResponseEntity.ok(pending);
    }
}
