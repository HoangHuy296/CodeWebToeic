package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfirmPhoneChangeRequest(
    @NotBlank @Size(min = 8, max = 20) String newPhone,
    @NotBlank @Size(min = 6, max = 6) String otpCode
) {
}
