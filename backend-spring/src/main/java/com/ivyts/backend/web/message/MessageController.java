package com.ivyts.backend.web.message;

import com.ivyts.backend.web.shared.MigrationPlaceholderController;
import java.util.Map;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/messages")
public class MessageController extends MigrationPlaceholderController {

    @GetMapping
    public Object listMessages() { return notImplemented("messages.list"); }

    @GetMapping("/recipients")
    public Object listRecipients() { return notImplemented("messages.recipients"); }

    @PostMapping
    public Object createContactMessage(@RequestBody Map<String, Object> body) { return notImplemented("messages.contact.create"); }

    @PostMapping("/internal")
    public Object createInternalMessage(@RequestBody Map<String, Object> body) { return notImplemented("messages.internal.create"); }

    @PatchMapping("/{id}/read")
    public Object markRead(@PathVariable String id, @RequestBody Map<String, Object> body) { return notImplemented("messages.read"); }
}
