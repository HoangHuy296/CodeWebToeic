package com.ivyts.backend.service.messagestore;

import com.ivyts.backend.domain.message.Message;
import com.ivyts.backend.relational.message.MessageEntity;
import com.ivyts.backend.relational.message.MessageJpaRepository;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class MySqlMessageStore implements MessageStore {

    private final MessageJpaRepository messageJpaRepository;

    public MySqlMessageStore(MessageJpaRepository messageJpaRepository) {
        this.messageJpaRepository = messageJpaRepository;
    }

    @Override
    public Optional<Message> findById(String id) {
        return messageJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Message> findAll() {
        return messageJpaRepository.findAll().stream().map(this::toDomain).toList();
    }

    @Override
    public Message save(Message message) {
        String messageId = message.getId() == null ? UUID.randomUUID().toString().replace("-", "") : message.getId();
        MessageEntity entity = message.getId() == null
            ? new MessageEntity()
            : messageJpaRepository.findById(message.getId()).orElseGet(MessageEntity::new);

        entity.setId(messageId);
        entity.setName(message.getName());
        entity.setEmail(message.getEmail());
        entity.setPhone(message.getPhone());
        entity.setSubject(message.getSubject());
        entity.setContent(message.getContent());
        entity.setSummary(message.getSummary());
        entity.setStatus(message.getStatus().name().toLowerCase(Locale.ROOT));
        entity.setMessageType(message.getMessageType().name().toLowerCase(Locale.ROOT));
        entity.setRecipientRole(message.getRecipientRole() == null ? null : message.getRecipientRole().name().toLowerCase(Locale.ROOT));
        entity.setRecipientUserId(message.getRecipientUser());
        entity.setSenderUserId(message.getSenderUser());
        entity.setAssignedToId(message.getAssignedTo());
        entity.setReadAt(message.getReadAt());
        entity.setRepliedAt(message.getRepliedAt());
        entity.setCreatedAt(message.getCreatedAt());
        entity.setUpdatedAt(message.getUpdatedAt());

        return toDomain(messageJpaRepository.save(entity));
    }

    private Message toDomain(MessageEntity entity) {
        Message message = new Message();
        message.setId(entity.getId());
        message.setName(entity.getName());
        message.setEmail(entity.getEmail());
        message.setPhone(entity.getPhone());
        message.setSubject(entity.getSubject());
        message.setContent(entity.getContent());
        message.setSummary(entity.getSummary());
        message.setStatus(com.ivyts.backend.domain.message.MessageStatus.valueOf(entity.getStatus().toUpperCase(Locale.ROOT).replace('-', '_')));
        message.setMessageType(com.ivyts.backend.domain.message.MessageType.valueOf(entity.getMessageType().toUpperCase(Locale.ROOT).replace('-', '_')));
        message.setRecipientRole(entity.getRecipientRole() == null ? null : com.ivyts.backend.domain.user.UserRole.valueOf(entity.getRecipientRole().toUpperCase(Locale.ROOT)));
        message.setRecipientUser(entity.getRecipientUserId());
        message.setSenderUser(entity.getSenderUserId());
        message.setAssignedTo(entity.getAssignedToId());
        message.setReadAt(entity.getReadAt());
        message.setRepliedAt(entity.getRepliedAt());
        message.setCreatedAt(entity.getCreatedAt());
        message.setUpdatedAt(entity.getUpdatedAt());
        return message;
    }
}
