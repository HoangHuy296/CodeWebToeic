package com.ivyts.backend.web.exercise.dto;

import jakarta.validation.constraints.NotBlank;

public record ExercisePackRequest(
    @NotBlank String slug,
    @NotBlank String title,
    @NotBlank String summary
) {
}
