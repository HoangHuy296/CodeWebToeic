package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 120) String fullName,
    String avatarUrl,
    @Size(max = 1000) String bio
) {
}
