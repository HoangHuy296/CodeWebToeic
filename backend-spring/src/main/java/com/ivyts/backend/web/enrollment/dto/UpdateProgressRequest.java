package com.ivyts.backend.web.enrollment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record UpdateProgressRequest(
    @NotBlank String lessonId,
    @Min(0) Integer watchedSeconds,
    Boolean isCompleted,
    Instant lastAccessedAt
) {
}
