package com.ivyts.backend.web.auth.dto;

import com.ivyts.backend.domain.user.UserRole;
import java.util.List;

public record PublicUserResponse(
    String id,
    String fullName,
    String email,
    UserRole role,
    String avatarUrl,
    String phone,
    String bio,
    boolean isActive,
    List<String> ownedCourseIds
) {
}
