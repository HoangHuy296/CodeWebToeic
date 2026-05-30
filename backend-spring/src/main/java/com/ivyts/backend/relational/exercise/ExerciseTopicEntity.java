package com.ivyts.backend.relational.exercise;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "exercise_topics")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseTopicEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(length = 191, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String label;

    @Column(name = "short_label", nullable = false)
    private String shortLabel;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String accent;

    @Column(name = "keywords_json", columnDefinition = "json")
    private String keywordsJson;

    @Column(name = "sections_json", columnDefinition = "json")
    private String sectionsJson;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
