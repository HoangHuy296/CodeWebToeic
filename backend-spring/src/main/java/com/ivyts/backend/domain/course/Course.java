package com.ivyts.backend.domain.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Course {

    private String id;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private String category;
    private String level = "beginner";
    private double price;
    private Double salePrice;
    private String thumbnail;
    private VideoMetadata introVideo;
    private List<MaterialItem> materials = new ArrayList<>();
    private String owner;
    private int lessonCount;
    private int totalDuration;
    private List<String> tags = new ArrayList<>();
    private List<String> benefits = new ArrayList<>();
    private boolean isPublished;
    private String reviewStatus = "pending_review";
    private String reviewNote;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public CourseLevel getLevel() { return CourseLevel.valueOf(normalizeEnum(level)); }
    public void setLevel(CourseLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    public CourseReviewStatus getReviewStatus() { return CourseReviewStatus.valueOf(normalizeEnum(reviewStatus)); }
    public void setReviewStatus(CourseReviewStatus reviewStatus) { this.reviewStatus = reviewStatus.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value) {
        return (value == null ? "beginner" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
