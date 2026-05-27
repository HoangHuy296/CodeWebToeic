package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.constraints.NotBlank;

public record QuestionOptionRequest(
    @NotBlank String key,
    @NotBlank String text,
    boolean isCorrect
) {
}
