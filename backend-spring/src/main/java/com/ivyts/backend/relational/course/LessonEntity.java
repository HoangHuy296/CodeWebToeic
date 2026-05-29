package com.ivyts.backend.relational.course;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "lessons")
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getVideoJson() { return videoJson; }
    public void setVideoJson(String videoJson) { this.videoJson = videoJson; }
    public int getLessonOrder() { return lessonOrder; }
    public void setLessonOrder(int lessonOrder) { this.lessonOrder = lessonOrder; }
    public boolean isPreview() { return isPreview; }
    public void setPreview(boolean preview) { isPreview = preview; }
    public String getMaterialsJson() { return materialsJson; }
    public void setMaterialsJson(String materialsJson) { this.materialsJson = materialsJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
