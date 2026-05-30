package com.ivyts.backend.relational.mocktest;

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
@Table(name = "mock_tests")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MockTestEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "created_by_id", length = 64, nullable = false)
    private String createdById;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 32)
    private String type;

    @Column(nullable = false, length = 32)
    private String level;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "question_count", nullable = false)
    private int questionCount;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "instructions", columnDefinition = "json")
    private String instructionsJson;

    @Column(name = "is_featured", nullable = false)
    private boolean isFeatured;

    @Column(name = "assigned_course_ids", columnDefinition = "json")
    private String assignedCourseIdsJson;

    @Column(name = "catalog_kind", nullable = false, length = 32)
    private String catalogKind = "mock-test";

    @Column(name = "exercise_topic_slug", length = 191)
    private String exerciseTopicSlug;

    @Column(name = "exercise_pack_slug", length = 191)
    private String exercisePackSlug;

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
