package com.ivyts.backend.web.course.dto;

import com.ivyts.backend.domain.course.CourseLevel;
import com.ivyts.backend.domain.course.CourseReviewStatus;
import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateCourseRequest(
    @NotBlank @Size(min = 3) String title,
    String slug,
    @NotBlank @Size(min = 10, max = 300) String shortDescription,
    @NotBlank @Size(min = 20) String description,
    @NotBlank @Size(min = 2) String category,
    @NotNull CourseLevel level,
    @DecimalMin("0.0") double price,
    @DecimalMin("0.0") Double salePrice,
    @NotBlank String thumbnail,
    @Valid @NotNull VideoMetadata introVideo,
    List<@Valid MaterialItem> materials,
    List<String> tags,
    List<String> benefits,
    Boolean isPublished,
    CourseReviewStatus reviewStatus,
    @Size(max = 1000) String reviewNote
) {
}
