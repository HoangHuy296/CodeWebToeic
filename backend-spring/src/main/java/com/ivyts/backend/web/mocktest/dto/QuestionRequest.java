package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record QuestionRequest(
    String section,
    @NotBlank String prompt,
    String explanation,
    @NotEmpty List<@Valid QuestionOptionRequest> options,
    @NotBlank String correctAnswer,
    String audioUrl,
    String imageUrl,
    @Min(1) Integer points,
    @NotNull @Min(1) Integer order,
    String level
) {
}
