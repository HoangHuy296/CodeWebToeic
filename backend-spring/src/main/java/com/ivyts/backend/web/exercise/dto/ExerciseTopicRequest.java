package com.ivyts.backend.web.exercise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ExerciseTopicRequest(
    String slug,
    @NotBlank String label,
    @NotBlank String shortLabel,
    @NotBlank String description,
    @NotBlank String accent,
    List<String> keywords,
    List<@Valid ExerciseTopicSectionRequest> sections
) {
}
