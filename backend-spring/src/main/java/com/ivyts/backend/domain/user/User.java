package com.ivyts.backend.domain.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    private String id;
    private String fullName;
    private String email;
    private String passwordHash;
    private String role = "student";
    private String googleSub;
    private boolean googleEmailVerified;
    private Instant googleLinkedAt;
    private Instant lastLoginAt;
    private String avatarUrl;
    private String phone;
    private String bio;
    private boolean isActive = true;
    private String refreshToken;
    private List<String> ownedCourseIds = new ArrayList<>();
    private PendingEmailChange pendingEmailChange;
    private PendingPhoneChange pendingPhoneChange;
    private Instant createdAt;
    private Instant updatedAt;

    public UserRole getRole() { return UserRole.valueOf(normalizeEnum(role)); }
    public void setRole(UserRole role) { this.role = role.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value) {
        return (value == null ? "student" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
