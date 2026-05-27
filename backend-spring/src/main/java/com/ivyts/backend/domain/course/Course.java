package com.ivyts.backend.domain.course;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("courses")
@CompoundIndexes({
    @CompoundIndex(name = "course_category_level_published_idx", def = "{'category': 1, 'level': 1, 'isPublished': 1}")
})
public class Course {

    @Id
    private String id;
    private String title;
    @Indexed(unique = true)
    private String slug;
    private String shortDescription;
    private String description;
    private String category;
    @Indexed
    private String level = "beginner";
    private double price;
    private Double salePrice;
    private String thumbnail;
    private VideoMetadata introVideo;
    private List<MaterialItem> materials = new ArrayList<>();
    @Indexed
    private String owner;
    private int lessonCount;
    private int totalDuration;
    private List<String> tags = new ArrayList<>();
    private List<String> benefits = new ArrayList<>();
    @Indexed
    private boolean isPublished;
    @Indexed
    private String reviewStatus = "pending_review";
    private String reviewNote;
    private Instant publishedAt;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public CourseLevel getLevel() { return CourseLevel.valueOf(normalizeEnum(level)); }
    public void setLevel(CourseLevel level) { this.level = level.name().toLowerCase(Locale.ROOT); }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public Double getSalePrice() { return salePrice; }
    public void setSalePrice(Double salePrice) { this.salePrice = salePrice; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public VideoMetadata getIntroVideo() { return introVideo; }
    public void setIntroVideo(VideoMetadata introVideo) { this.introVideo = introVideo; }
    public List<MaterialItem> getMaterials() { return materials; }
    public void setMaterials(List<MaterialItem> materials) { this.materials = materials; }
    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }
    public int getLessonCount() { return lessonCount; }
    public void setLessonCount(int lessonCount) { this.lessonCount = lessonCount; }
    public int getTotalDuration() { return totalDuration; }
    public void setTotalDuration(int totalDuration) { this.totalDuration = totalDuration; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public List<String> getBenefits() { return benefits; }
    public void setBenefits(List<String> benefits) { this.benefits = benefits; }
    public boolean isPublished() { return isPublished; }
    public void setPublished(boolean published) { isPublished = published; }
    public CourseReviewStatus getReviewStatus() { return CourseReviewStatus.valueOf(normalizeEnum(reviewStatus)); }
    public void setReviewStatus(CourseReviewStatus reviewStatus) { this.reviewStatus = reviewStatus.name().toLowerCase(Locale.ROOT); }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    private String normalizeEnum(String value) {
        return (value == null ? "beginner" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
