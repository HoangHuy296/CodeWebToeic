package com.ivyts.backend.relational.course;

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
@Table(name = "lessons")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LessonEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "course_id", length = 64, nullable = false)
    private String courseId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 191)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(columnDefinition = "json")
    private String videoJson;

    @Column(name = "lesson_order", nullable = false)
    private int lessonOrder;

    @Column(name = "is_preview", nullable = false)
    private boolean isPreview;

    @Column(columnDefinition = "json")
    private String materialsJson;

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
