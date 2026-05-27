package com.ivyts.backend.web.auth.dto;

public record AuthResponse(
    PublicUserResponse user,
    String accessToken,
    String refreshToken
) {
}
