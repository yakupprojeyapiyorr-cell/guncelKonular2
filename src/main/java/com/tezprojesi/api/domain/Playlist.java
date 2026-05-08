package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "playlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Playlist {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    private String youtubePlaylistId;
    private String title;
    private Integer videoCount;
    private Integer totalDurationMinutes;

    @ManyToOne
    @JoinColumn(name = "added_by")
    private User addedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL)
    private List<VideoProgress> videoProgresses;
}
