package com.tezprojesi.api.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "topics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private String name;

    private Integer orderIndex;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    private List<Question> questions;

    @OneToOne(mappedBy = "topic", cascade = CascadeType.ALL)
    private TopicSummary summary;

    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL)
    private List<PomodoroSession> pomodoroSessions;
}
