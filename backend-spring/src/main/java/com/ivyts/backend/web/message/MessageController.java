package com.ivyts.backend.web.message;

import com.ivyts.backend.common.api.ApiSuccessResponse;
import com.ivyts.backend.security.RequestAuthService;
import com.ivyts.backend.service.MessageService;
import com.ivyts.backend.web.message.dto.CreateContactMessageRequest;
import com.ivyts.backend.web.message.dto.CreateInternalMessageRequest;
import com.ivyts.backend.web.message.dto.MarkMessageRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
public class MessageController {

    private final MessageService messageService;
    private final RequestAuthService requestAuthService;

    public MessageController(MessageService messageService, RequestAuthService requestAuthService) {
        this.messageService = messageService;
        this.requestAuthService = requestAuthService;
    }

    @GetMapping
    public ApiSuccessResponse<?> listMessages(HttpServletRequest request) {
        return ApiSuccessResponse.of("Messages fetched successfully", messageService.listMessages(requestAuthService.requireUser(request)));
    }

    @GetMapping("/recipients")
    public ApiSuccessResponse<?> listRecipients(HttpServletRequest request) {
        return ApiSuccessResponse.of("Recipients fetched successfully", messageService.listRecipients(requestAuthService.requireUser(request)));
    }

    @PostMapping
    public ApiSuccessResponse<?> createContactMessage(@Valid @RequestBody CreateContactMessageRequest body) {
        return ApiSuccessResponse.of("Message created successfully", messageService.createContactMessage(body));
    }

    @PostMapping("/internal")
    public ApiSuccessResponse<?> createInternalMessage(HttpServletRequest request, @Valid @RequestBody CreateInternalMessageRequest body) {
        return ApiSuccessResponse.of("Message created successfully", messageService.createInternalMessage(body, requestAuthService.requireUser(request)));
    }

    @PatchMapping("/{id}/read")
    public ApiSuccessResponse<?> markRead(@PathVariable String id, HttpServletRequest request, @RequestBody(required = false) MarkMessageRequest body) {
        return ApiSuccessResponse.of("Message updated successfully", messageService.markMessage(id, body == null ? new MarkMessageRequest("read") : body, requestAuthService.requireUser(request)));
    }
}
