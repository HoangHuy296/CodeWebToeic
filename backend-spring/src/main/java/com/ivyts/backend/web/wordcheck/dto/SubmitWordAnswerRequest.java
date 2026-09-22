package com.ivyts.backend.web.wordcheck.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubmitWordAnswerRequest(
    @NotBlank String questionId,
    @Size(max = 500) String typed,
    @Valid WordSessionInfo session
) {
}
