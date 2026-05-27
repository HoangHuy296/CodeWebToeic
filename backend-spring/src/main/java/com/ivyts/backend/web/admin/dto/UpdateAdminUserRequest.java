package com.ivyts.backend.web.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateAdminUserRequest(
    @Size(min = 2) String fullName,
    @Email String email,
    String role,
    String avatarUrl,
    @Size(min = 8, max = 20) String phone,
    @Size(max = 1000) String bio,
    Boolean isActive
) {
}
