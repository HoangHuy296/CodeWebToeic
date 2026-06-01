package com.ivyts.backend.relational.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserAuthEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 191)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "role", nullable = false, length = 32)
    private String role;

    @Column(name = "google_sub", unique = true, length = 191)
    private String googleSub;

    @Column(name = "google_email_verified", nullable = false)
    private boolean googleEmailVerified;

    @Column(name = "google_linked_at")
    private Instant googleLinkedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

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
}
