package com.ivyts.backend.domain.post;

import lombok.AllArgsConstructor;
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

    public BlogPostStatus getStatus() { return BlogPostStatus.valueOf(normalizeEnum(status, "draft")); }
    public void setStatus(BlogPostStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
