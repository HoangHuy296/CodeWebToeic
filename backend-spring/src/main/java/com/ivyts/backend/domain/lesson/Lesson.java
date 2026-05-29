package com.ivyts.backend.domain.lesson;

import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
public class Lesson {

    private String id;
    private String course;
    private String title;
    private String slug;
    private String description;
    private String content;
    private VideoMetadata video;
    private int order;
    private boolean isPreview;
    private List<MaterialItem> materials = new ArrayList<>();
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public VideoMetadata getVideo() { return video; }
    public void setVideo(VideoMetadata video) { this.video = video; }
    public int getOrder() { return order; }
    public void setOrder(int order) { this.order = order; }
    public boolean isPreview() { return isPreview; }
    public void setPreview(boolean preview) { isPreview = preview; }
    public List<MaterialItem> getMaterials() { return materials; }
    public void setMaterials(List<MaterialItem> materials) { this.materials = materials; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
