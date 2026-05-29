package com.ivyts.backend.domain.mocktest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
public class MockTest {

    private String id;
    private String title;
    private String description;
    private String type = "mini-test";
    private String level = "beginner";
    private int durationMinutes;
    private int questionCount;
    private String status = "draft";
    private List<String> instructions = new ArrayList<>();
    private String createdBy;
    private boolean isFeatured;
    private List<String> assignedCourses = new ArrayList<>();
    private String catalogKind = "mock-test";
    private String exerciseTopicSlug;
    private String exercisePackSlug;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public MockTestType getType() { return MockTestType.valueOf(normalizeEnum(type)); }
    public void setType(MockTestType type) { this.type = type.name().toLowerCase(Locale.ROOT).replace('_', '-'); }
    public MockTestLevel getLevel() { return MockTestLevel.valueOf(normalizeEnum(level)); }
    public void setLevel(MockTestLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public MockTestStatus getStatus() { return MockTestStatus.valueOf(normalizeEnum(status)); }
    public void setStatus(MockTestStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }
    public List<String> getInstructions() { return instructions; }
    public void setInstructions(List<String> instructions) { this.instructions = instructions; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public boolean isFeatured() { return isFeatured; }
    public void setFeatured(boolean featured) { isFeatured = featured; }
    public List<String> getAssignedCourses() { return assignedCourses; }
    public void setAssignedCourses(List<String> assignedCourses) { this.assignedCourses = assignedCourses; }
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

    private String normalizeEnum(String value) {
        return (value == null ? "draft" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
