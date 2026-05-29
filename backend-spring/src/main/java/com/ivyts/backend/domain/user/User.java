package com.ivyts.backend.domain.user;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
public class User {

    private String id;
    private String fullName;
    private String email;
    private String passwordHash;
    private String role = "student";
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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public UserRole getRole() { return UserRole.valueOf(normalizeEnum(role)); }
    public void setRole(UserRole role) { this.role = role.name().toLowerCase(Locale.ROOT); }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public List<String> getOwnedCourseIds() { return ownedCourseIds; }
    public void setOwnedCourseIds(List<String> ownedCourseIds) { this.ownedCourseIds = ownedCourseIds; }
    public PendingEmailChange getPendingEmailChange() { return pendingEmailChange; }
    public void setPendingEmailChange(PendingEmailChange pendingEmailChange) { this.pendingEmailChange = pendingEmailChange; }
    public PendingPhoneChange getPendingPhoneChange() { return pendingPhoneChange; }
    public void setPendingPhoneChange(PendingPhoneChange pendingPhoneChange) { this.pendingPhoneChange = pendingPhoneChange; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    private String normalizeEnum(String value) {
        return (value == null ? "student" : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
