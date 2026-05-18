package com.ivyts.backend.domain.user;

import java.time.Instant;

public record PendingEmailChange(
    String newEmail,
    String verificationCode,
    Instant expiresAt
) {
}
