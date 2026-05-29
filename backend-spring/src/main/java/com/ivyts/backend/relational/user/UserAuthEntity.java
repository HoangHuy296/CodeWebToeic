package com.ivyts.backend.relational.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserAuthEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 191)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 32)
    private String role;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "phone", length = 32)
    private String phone;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "owned_course_ids", columnDefinition = "json")
    private String ownedCourseIdsJson;

    @Column(name = "pending_email_change", columnDefinition = "json")
    private String pendingEmailChangeJson;

    @Column(name = "pending_phone_change", columnDefinition = "json")
    private String pendingPhoneChangeJson;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
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
    public String getOwnedCourseIdsJson() { return ownedCourseIdsJson; }
    public void setOwnedCourseIdsJson(String ownedCourseIdsJson) { this.ownedCourseIdsJson = ownedCourseIdsJson; }
    public String getPendingEmailChangeJson() { return pendingEmailChangeJson; }
    public void setPendingEmailChangeJson(String pendingEmailChangeJson) { this.pendingEmailChangeJson = pendingEmailChangeJson; }
    public String getPendingPhoneChangeJson() { return pendingPhoneChangeJson; }
    public void setPendingPhoneChangeJson(String pendingPhoneChangeJson) { this.pendingPhoneChangeJson = pendingPhoneChangeJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
