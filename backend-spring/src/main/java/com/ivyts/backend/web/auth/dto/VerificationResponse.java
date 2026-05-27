package com.ivyts.backend.web.auth.dto;

import java.time.Instant;

public record VerificationResponse(
    String deliveryTarget,
    Instant expiresAt,
    String verificationPreviewCode
) {
}
