package com.ivyts.backend.web.mocktest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SubmitMockTestRequest(
    @Min(0) Integer durationSeconds,
    @NotEmpty List<@Valid SubmitAnswerRequest> answers
) {
}
