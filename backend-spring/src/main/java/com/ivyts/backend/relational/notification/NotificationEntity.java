package com.ivyts.backend.relational.notification;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column(name = "recipient_user_id", length = 64, nullable = false)
    private String recipientUserId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String message;

    @Column(nullable = false, length = 32)
    private String severity;

    @Column(name = "entity_type", nullable = false, length = 32)
    private String entityType;

    @Column(nullable = false, length = 32)
    private String channel;

    @Column(name = "actor_role", length = 32)
    private String actorRole;

    @Column(name = "actor_user_id", length = 64)
    private String actorUserId;

    @Column(name = "metadata_json", columnDefinition = "LONGTEXT")
    private String metadataJson;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
