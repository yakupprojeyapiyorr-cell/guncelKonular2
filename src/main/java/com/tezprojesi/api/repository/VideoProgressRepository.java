package com.tezprojesi.api.repository;

import com.tezprojesi.api.domain.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, UUID> {
    List<VideoProgress> findByUserIdAndPlaylistId(UUID userId, UUID playlistId);
    java.util.Optional<VideoProgress> findByUserIdAndPlaylistIdAndYoutubeVideoId(UUID userId, UUID playlistId, String youtubeVideoId);
}
