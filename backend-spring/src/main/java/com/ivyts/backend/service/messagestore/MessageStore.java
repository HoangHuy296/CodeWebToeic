package com.ivyts.backend.service.messagestore;

import com.ivyts.backend.domain.message.Message;
import java.util.List;
import java.util.Optional;

public interface MessageStore {

    Optional<Message> findById(String id);

    List<Message> findAll();

    Message save(Message message);
}
