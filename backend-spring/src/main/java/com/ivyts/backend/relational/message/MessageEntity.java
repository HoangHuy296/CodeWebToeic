package com.ivyts.backend.relational.message;

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
@Table(name = "messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageEntity {

    @Id
    @Column(length = 64, nullable = false)
    private String id;

    @Column
    private String name;

    @Column(length = 191)
    private String email;

    @Column(length = 32)
    private String phone;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "message_type", nullable = false, length = 32)
    private String messageType;

    @Column(name = "recipient_role", length = 32)
    private String recipientRole;

    @Column(name = "recipient_user_id", length = 64)
    private String recipientUserId;

    @Column(name = "sender_user_id", length = 64)
    private String senderUserId;

    @Column(name = "assigned_to_id", length = 64)
    private String assignedToId;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "replied_at")
    private Instant repliedAt;

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
