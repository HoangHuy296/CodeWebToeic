package com.ivyts.backend.relational.mocktest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "mock_tests")
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCreatedById() { return createdById; }
    public void setCreatedById(String createdById) { this.createdById = createdById; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInstructionsJson() { return instructionsJson; }
    public void setInstructionsJson(String instructionsJson) { this.instructionsJson = instructionsJson; }
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }
    public String getAssignedCourseIdsJson() { return assignedCourseIdsJson; }
    public void setAssignedCourseIdsJson(String assignedCourseIdsJson) { this.assignedCourseIdsJson = assignedCourseIdsJson; }
    public String getCatalogKind() { return catalogKind; }
    public void setCatalogKind(String catalogKind) { this.catalogKind = catalogKind; }
    public String getExerciseTopicSlug() { return exerciseTopicSlug; }
    public void setExerciseTopicSlug(String exerciseTopicSlug) { this.exerciseTopicSlug = exerciseTopicSlug; }
    public String getExercisePackSlug() { return exercisePackSlug; }
    public void setExercisePackSlug(String exercisePackSlug) { this.exercisePackSlug = exercisePackSlug; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
