package com.ivyts.backend.web.message.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactMessageRequest(
    @NotBlank @Size(min = 2) String name,
    @NotBlank @Email String email,
    @Size(min = 8, max = 20) String phone,
    @NotBlank @Size(min = 3) String subject,
    @NotBlank @Size(min = 10) String content
) {
}
