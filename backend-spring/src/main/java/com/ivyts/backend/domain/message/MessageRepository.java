package com.ivyts.backend.domain.message;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByRecipientUserOrAssignedToOrderByCreatedAtDesc(String recipientUser, String assignedTo);
}
