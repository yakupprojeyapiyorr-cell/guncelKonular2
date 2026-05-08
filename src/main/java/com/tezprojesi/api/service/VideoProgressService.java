package com.tezprojesi.api.service;

import com.tezprojesi.api.domain.VideoProgress;
import com.tezprojesi.api.dto.VideoProgressRequest;
import com.tezprojesi.api.repository.PlaylistRepository;
import com.tezprojesi.api.repository.UserRepository;
import com.tezprojesi.api.repository.VideoProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoProgressService {

    private final VideoProgressRepository videoProgressRepository;
    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;

    @Transactional
    public void saveProgress(UUID userId, VideoProgressRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        var playlist = playlistRepository.findById(request.getPlaylistId())
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        var progress = videoProgressRepository.findByUserIdAndPlaylistIdAndYoutubeVideoId(
                userId, request.getPlaylistId(), request.getYoutubeVideoId())
                .orElse(VideoProgress.builder()
                        .user(user)
                        .playlist(playlist)
                        .youtubeVideoId(request.getYoutubeVideoId())
                        .build());

        progress.setIsWatched(request.getIsWatched());
        videoProgressRepository.save(progress);
    }

    public List<String> getWatchedVideoIds(UUID userId, UUID playlistId) {
        return videoProgressRepository.findByUserIdAndPlaylistId(userId, playlistId)
                .stream()
                .filter(VideoProgress::getIsWatched)
                .map(VideoProgress::getYoutubeVideoId)
                .collect(Collectors.toList());
    }
}
