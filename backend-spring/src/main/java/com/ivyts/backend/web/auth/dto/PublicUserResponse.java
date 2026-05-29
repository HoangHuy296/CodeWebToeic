package com.ivyts.backend.web.auth.dto;

import java.util.List;

public record PublicUserResponse(
    String id,
    String fullName,
    String email,
    String role,
    String avatarUrl,
    String phone,
    String bio,
    boolean isActive,
    List<String> ownedCourseIds
) {
}
