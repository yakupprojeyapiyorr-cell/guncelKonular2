package com.tezprojesi.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaylistResponse {
    private UUID id;
    private String youtubePlaylistId;
    private String title;
    private Integer videoCount;
    private Integer totalDurationMinutes;
}
