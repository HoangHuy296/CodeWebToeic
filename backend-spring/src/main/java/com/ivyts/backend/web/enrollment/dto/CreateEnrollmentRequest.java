package com.ivyts.backend.web.enrollment.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEnrollmentRequest(
    @NotBlank String courseId
) {
}
