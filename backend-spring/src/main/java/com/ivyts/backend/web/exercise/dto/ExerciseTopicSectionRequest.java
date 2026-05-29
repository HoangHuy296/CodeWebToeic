package com.ivyts.backend.web.exercise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ExerciseTopicSectionRequest(
    @NotBlank String id,
    @NotBlank String title,
    @NotBlank String description,
    List<@Valid ExercisePackRequest> packs
) {
}
