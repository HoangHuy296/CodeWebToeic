package com.ivyts.backend.relational.post;

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
@Table(name = "blog_posts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BlogPostEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "author_id", length = 64, nullable = false)
    private String authorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 191)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String excerpt;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "thumbnail", columnDefinition = "TEXT")
    private String coverImage;

    @Column(name = "tags", columnDefinition = "json")
    private String tagsJson;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "seo_description", columnDefinition = "TEXT")
    private String seoDescription;

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
