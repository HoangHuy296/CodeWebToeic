package com.ivyts.backend.web.message.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateInternalMessageRequest(
    @NotBlank String recipientUserId,
    @NotBlank @Size(min = 3) String subject,
    @NotBlank @Size(min = 10) String content
) {
}
