package com.ivyts.backend.web.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreatePostRequest(
    @NotBlank @Size(min = 3, max = 255) String title,
    String slug,
    @NotBlank @Size(min = 10, max = 600) String excerpt,
    @NotBlank @Size(min = 20) String content,
    String coverImage,
    List<String> tags,
    String status,
    String seoDescription
) {
}
