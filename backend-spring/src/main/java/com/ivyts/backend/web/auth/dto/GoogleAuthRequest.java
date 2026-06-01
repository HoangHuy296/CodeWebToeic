package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
    @NotBlank(message = "Google credential is required")
    String credential,
    @NotBlank(message = "Intended role is required")
    String intendedRole
) {
}
