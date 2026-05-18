package com.ivyts.backend.domain.user;

import java.time.Instant;

public record PendingPhoneChange(
    String newPhone,
    String otpCode,
    Instant expiresAt
) {
}
