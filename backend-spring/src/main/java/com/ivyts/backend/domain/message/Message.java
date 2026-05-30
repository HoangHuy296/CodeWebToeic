package com.ivyts.backend.domain.message;

import com.ivyts.backend.domain.user.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Locale;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Message {

    private String id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String content;
    private String summary;
    private String status = "unread";
    private String messageType = "contact";
    private String recipientRole;
    private String recipientUser;
    private String senderUser;
    private Instant readAt;
    private Instant repliedAt;
    private String assignedTo;
    private Instant createdAt;
    private Instant updatedAt;
    public MessageStatus getStatus() { return MessageStatus.valueOf(normalizeEnum(status, "unread")); }
    public void setStatus(MessageStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }
    public MessageType getMessageType() { return MessageType.valueOf(normalizeEnum(messageType, "contact")); }
    public void setMessageType(MessageType messageType) { this.messageType = messageType.name().toLowerCase(Locale.ROOT); }
    public UserRole getRecipientRole() { return recipientRole == null ? null : UserRole.valueOf(normalizeEnum(recipientRole, "student")); }
    public void setRecipientRole(UserRole recipientRole) { this.recipientRole = recipientRole == null ? null : recipientRole.name().toLowerCase(Locale.ROOT); }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
