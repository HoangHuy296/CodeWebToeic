package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.NotBlank;

/** `email` is not `@Email`-validated: the admin account logs in with a plain "admin" username. */
public record LoginRequest(
    @NotBlank String email,
    @NotBlank String password
) {
}
