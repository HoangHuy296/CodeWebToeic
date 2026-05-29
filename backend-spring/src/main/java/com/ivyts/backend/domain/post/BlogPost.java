package com.ivyts.backend.domain.post;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
public class BlogPost {

    private String id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String coverImage;
    private List<String> tags = new ArrayList<>();
    private String author;
    private String status = "draft";
    private String seoDescription;
    private Instant publishedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public BlogPostStatus getStatus() { return BlogPostStatus.valueOf(normalizeEnum(status, "draft")); }
    public void setStatus(BlogPostStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }
    public String getSeoDescription() { return seoDescription; }
    public void setSeoDescription(String seoDescription) { this.seoDescription = seoDescription; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
