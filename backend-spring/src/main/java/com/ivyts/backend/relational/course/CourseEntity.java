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

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "courses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CourseEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "owner_id", length = 64, nullable = false)
    private String ownerId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 191)
    private String slug;

    @Column(name = "short_description", columnDefinition = "TEXT", nullable = false)
    private String shortDescription;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 120)
    private String category;

    @Column(nullable = false, length = 32)
    private String level;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    @Column(name = "intro_video", columnDefinition = "json")
    private String introVideoJson;

    @Column(columnDefinition = "json")
    private String materialsJson;

    @Column(name = "lesson_count", nullable = false)
    private int lessonCount;

    @Column(name = "total_duration", nullable = false)
    private int totalDuration;

    @Column(columnDefinition = "json")
    private String tagsJson;

    @Column(columnDefinition = "json")
    private String benefitsJson;

    @Column(name = "is_published", nullable = false)
    private boolean isPublished;

    @Column(name = "review_status", nullable = false, length = 32)
    private String reviewStatus;

    @Column(name = "review_note", columnDefinition = "TEXT")
    private String reviewNote;

    @Column(name = "published_at")
    private Instant publishedAt;

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
