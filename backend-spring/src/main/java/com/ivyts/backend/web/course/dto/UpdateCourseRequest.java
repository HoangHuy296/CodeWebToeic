package com.ivyts.backend.web.course.dto;

import com.ivyts.backend.domain.course.CourseLevel;
import com.ivyts.backend.domain.course.CourseReviewStatus;
import com.ivyts.backend.domain.course.MaterialItem;
import com.ivyts.backend.domain.course.VideoMetadata;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateCourseRequest(
    @Size(min = 3) String title,
    @Size(min = 3) String slug,
    @Size(min = 10, max = 300) String shortDescription,
    @Size(min = 20) String description,
    @Size(min = 2) String category,
    CourseLevel level,
    @DecimalMin("0.0") Double price,
    @DecimalMin("0.0") Double salePrice,
    String thumbnail,
    @Valid VideoMetadata introVideo,
    List<@Valid MaterialItem> materials,
    List<String> tags,
    List<String> benefits,
    Boolean isPublished,
    CourseReviewStatus reviewStatus,
    @Size(max = 1000) String reviewNote
) {
}
