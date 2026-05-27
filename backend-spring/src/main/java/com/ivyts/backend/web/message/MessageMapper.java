package com.ivyts.backend.web.message;

import com.ivyts.backend.domain.message.Message;
import com.ivyts.backend.domain.user.User;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public Map<String, Object> toMessageView(Message message, User assignedTo, User recipientUser, User senderUser) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", message.getId());
        data.put("name", message.getName());
        data.put("email", message.getEmail());
        data.put("phone", message.getPhone());
        data.put("subject", message.getSubject());
        data.put("content", message.getContent());
        data.put("summary", message.getSummary());
        data.put("status", message.getStatus().name().toLowerCase());
        data.put("messageType", message.getMessageType().name().toLowerCase());
        data.put("recipientRole", message.getRecipientRole() != null ? message.getRecipientRole().name().toLowerCase() : null);
        data.put("readAt", message.getReadAt());
        data.put("repliedAt", message.getRepliedAt());
        data.put("assignedTo", toUserPreview(assignedTo));
        data.put("recipientUser", toUserPreview(recipientUser));
        data.put("senderUser", toUserPreview(senderUser));
        data.put("createdAt", message.getCreatedAt());
        return data;
    }

    public Map<String, Object> toRecipientView(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole().name().toLowerCase());
        return data;
    }

    private Map<String, Object> toUserPreview(User user) {
        if (user == null) {
            return null;
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", user.getId());
        data.put("fullName", user.getFullName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole().name().toLowerCase());
        return data;
    }
}
