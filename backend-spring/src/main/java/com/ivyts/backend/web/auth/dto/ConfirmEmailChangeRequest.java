package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmEmailChangeRequest(
    @NotBlank @Email String newEmail,
    @NotBlank @Size(min = 6, max = 6) String verificationCode
) {
}
