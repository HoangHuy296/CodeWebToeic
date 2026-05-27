package com.ivyts.backend.web.course.dto;

import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateLessonRequest(
    @Size(min = 3) String title,
    @Size(min = 3) String slug,
    @Size(min = 10) String description,
    String content,
    @Valid VideoMetadata video,
    @Min(1) Integer order,
    Boolean isPreview,
    List<@Valid MaterialItem> materials
) {
}
