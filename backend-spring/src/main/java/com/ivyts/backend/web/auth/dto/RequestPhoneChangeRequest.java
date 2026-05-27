package com.ivyts.backend.web.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequestPhoneChangeRequest(@NotBlank @Size(min = 8, max = 20) String newPhone) {
}
