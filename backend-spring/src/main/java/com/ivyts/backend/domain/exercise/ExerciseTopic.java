package com.ivyts.backend.domain.exercise;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ExerciseTopic {

    private String id;
    private String slug;
    private String label;
    private String shortLabel;
    private String description;
    private String accent;
    private List<String> keywords = new ArrayList<>();
    private List<ExerciseTopicSection> sections = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

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
    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
    public List<ExerciseTopicSection> getSections() { return sections; }
    public void setSections(List<ExerciseTopicSection> sections) { this.sections = sections; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
