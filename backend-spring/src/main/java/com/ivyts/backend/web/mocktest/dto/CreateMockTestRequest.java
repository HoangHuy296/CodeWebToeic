package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateMockTestRequest(
    @NotBlank String title,
    @NotBlank String description,
    @NotBlank String type,
    @NotBlank String level,
    @Min(1) Integer durationMinutes,
    String status,
    List<String> instructions,
    Boolean isFeatured,
    List<String> assignedCourseIds,
    @NotEmpty List<@Valid QuestionRequest> questions
) {
}
