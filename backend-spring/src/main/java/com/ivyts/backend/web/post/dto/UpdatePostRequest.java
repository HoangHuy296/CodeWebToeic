package com.ivyts.backend.web.post.dto;

import java.util.List;

public record UpdatePostRequest(
    String title,
    String slug,
    String excerpt,
    String content,
    String coverImage,
    List<String> tags,
    String status,
    String seoDescription
) {
}
