package com.ivyts.backend.relational.exercise;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "exercise_topics")
public class ExerciseTopicEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(length = 191, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String label;

    @Column(name = "short_label", nullable = false)
    private String shortLabel;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String accent;

    @Column(name = "keywords_json", columnDefinition = "json")
    private String keywordsJson;

    @Column(name = "sections_json", columnDefinition = "json")
    private String sectionsJson;

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
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public String getShortLabel() { return shortLabel; }
    public void setShortLabel(String shortLabel) { this.shortLabel = shortLabel; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAccent() { return accent; }
    public void setAccent(String accent) { this.accent = accent; }
    public String getKeywordsJson() { return keywordsJson; }
    public void setKeywordsJson(String keywordsJson) { this.keywordsJson = keywordsJson; }
    public String getSectionsJson() { return sectionsJson; }
    public void setSectionsJson(String sectionsJson) { this.sectionsJson = sectionsJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
