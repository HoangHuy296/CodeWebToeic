package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdatePreferencesRequest(
    @NotBlank String preferredLanguage
) {
}
