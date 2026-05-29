package com.ivyts.backend.relational.course;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "courses")
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
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
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public String getIntroVideoJson() { return introVideoJson; }
    public void setIntroVideoJson(String introVideoJson) { this.introVideoJson = introVideoJson; }
    public String getMaterialsJson() { return materialsJson; }
    public void setMaterialsJson(String materialsJson) { this.materialsJson = materialsJson; }
    public int getLessonCount() { return lessonCount; }
    public void setLessonCount(int lessonCount) { this.lessonCount = lessonCount; }
    public int getTotalDuration() { return totalDuration; }
    public void setTotalDuration(int totalDuration) { this.totalDuration = totalDuration; }
    public String getTagsJson() { return tagsJson; }
    public void setTagsJson(String tagsJson) { this.tagsJson = tagsJson; }
    public String getBenefitsJson() { return benefitsJson; }
    public void setBenefitsJson(String benefitsJson) { this.benefitsJson = benefitsJson; }
    public boolean isPublished() { return isPublished; }
    public void setPublished(boolean published) { isPublished = published; }
    public String getReviewStatus() { return reviewStatus; }
    public void setReviewStatus(String reviewStatus) { this.reviewStatus = reviewStatus; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
