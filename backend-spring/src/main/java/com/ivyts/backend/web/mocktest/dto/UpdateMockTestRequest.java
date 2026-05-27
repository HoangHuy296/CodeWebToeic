package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.List;

public record UpdateMockTestRequest(
    String title,
    String description,
    String type,
    String level,
    @Min(1) Integer durationMinutes,
    String status,
    List<String> instructions,
    Boolean isFeatured,
    List<String> assignedCourseIds,
    List<@Valid QuestionRequest> questions
) {
}
