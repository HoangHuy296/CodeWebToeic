package com.ivyts.backend.domain.message;

import com.ivyts.backend.domain.user.UserRole;
import java.time.Instant;
import java.util.Locale;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("messages")
@CompoundIndexes({
    @CompoundIndex(name = "message_type_recipient_created_idx", def = "{'messageType': 1, 'recipientUser': 1, 'createdAt': -1}")
})
public class Message {

    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String content;
    private String summary;
    @Indexed
    private String status = "unread";
    @Indexed
    private String messageType = "contact";
    private String recipientRole;
    private String recipientUser;
    private String senderUser;
    private Instant readAt;
    private Instant repliedAt;
    private String assignedTo;
    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public MessageStatus getStatus() { return MessageStatus.valueOf(normalizeEnum(status, "unread")); }
    public void setStatus(MessageStatus status) { this.status = status.name().toLowerCase(Locale.ROOT); }
    public MessageType getMessageType() { return MessageType.valueOf(normalizeEnum(messageType, "contact")); }
    public void setMessageType(MessageType messageType) { this.messageType = messageType.name().toLowerCase(Locale.ROOT); }
    public UserRole getRecipientRole() { return recipientRole == null ? null : UserRole.valueOf(normalizeEnum(recipientRole, "student")); }
    public void setRecipientRole(UserRole recipientRole) { this.recipientRole = recipientRole == null ? null : recipientRole.name().toLowerCase(Locale.ROOT); }
    public String getRecipientUser() { return recipientUser; }
    public void setRecipientUser(String recipientUser) { this.recipientUser = recipientUser; }
    public String getSenderUser() { return senderUser; }
    public void setSenderUser(String senderUser) { this.senderUser = senderUser; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
    public Instant getRepliedAt() { return repliedAt; }
    public void setRepliedAt(Instant repliedAt) { this.repliedAt = repliedAt; }
    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    private String normalizeEnum(String value, String fallback) {
        return (value == null ? fallback : value).replace('-', '_').toUpperCase(Locale.ROOT);
    }
}
