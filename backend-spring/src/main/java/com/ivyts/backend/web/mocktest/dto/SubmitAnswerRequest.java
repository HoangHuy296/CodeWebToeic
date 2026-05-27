package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitAnswerRequest(
    @NotBlank String questionId,
    @NotBlank String selectedOption
) {
}
