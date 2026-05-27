package com.ivyts.backend.security;

import com.ivyts.backend.domain.user.UserRole;

public record AuthUser(
    String userId,
    String email,
    UserRole role
) {
}
