package com.ivyts.backend.web.course.dto;

import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateLessonRequest(
    @NotBlank @Size(min = 3) String title,
    String slug,
    @NotBlank @Size(min = 10) String description,
    String content,
    @Valid @NotNull VideoMetadata video,
    @Min(1) int order,
    Boolean isPreview,
    List<@Valid MaterialItem> materials
) {
}
