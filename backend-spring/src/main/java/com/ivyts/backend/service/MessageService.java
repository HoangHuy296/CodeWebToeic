package com.ivyts.backend.service;

import com.ivyts.backend.common.exception.ApiException;
import com.ivyts.backend.domain.course.Course;
import com.ivyts.backend.domain.enrollment.Enrollment;
import com.ivyts.backend.domain.enrollment.EnrollmentStatus;
import com.ivyts.backend.domain.message.Message;
import com.ivyts.backend.domain.message.MessageStatus;
import com.ivyts.backend.domain.message.MessageType;
import com.ivyts.backend.domain.user.User;
import com.ivyts.backend.domain.user.UserRole;
import com.ivyts.backend.notification.NotificationEventsService;
import com.ivyts.backend.security.AuthUser;
import com.ivyts.backend.service.coursestore.CourseStore;
import com.ivyts.backend.service.enrollmentstore.EnrollmentStore;
import com.ivyts.backend.service.messagestore.MessageStore;
import com.ivyts.backend.service.userstore.UserStore;
import com.ivyts.backend.web.message.MessageMapper;
import com.ivyts.backend.web.message.dto.CreateContactMessageRequest;
import com.ivyts.backend.web.message.dto.CreateInternalMessageRequest;
import com.ivyts.backend.web.message.dto.MarkMessageRequest;
import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private final MessageStore messageStore;
    private final UserStore userStore;
    private final CourseStore courseStore;
    private final EnrollmentStore enrollmentStore;
    private final MessageMapper mapper;
    private final NotificationEventsService notificationEventsService;

    public MessageService(
        MessageStore messageStore,
        UserStore userStore,
        CourseStore courseStore,
        EnrollmentStore enrollmentStore,
        MessageMapper mapper,
        NotificationEventsService notificationEventsService
    ) {
        this.messageStore = messageStore;
        this.userStore = userStore;
        this.courseStore = courseStore;
        this.enrollmentStore = enrollmentStore;
        this.mapper = mapper;
        this.notificationEventsService = notificationEventsService;
    }

    public List<Map<String, Object>> listMessages(AuthUser authUser) {
        return messageStore.findAll().stream()
            .filter(message -> canViewMessage(authUser, message))
            .sorted(Comparator.comparing(Message::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .map(this::toMessageView)
            .toList();
    }

    public Map<String, Object> createContactMessage(CreateContactMessageRequest request) {
        Message message = new Message();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        message.setPhone(blankToNull(request.phone()));
        message.setSubject(request.subject().trim());
        message.setContent(request.content().trim());
        message.setSummary(buildSummary(request.content()));
        message.setMessageType(MessageType.CONTACT);
        message.setStatus(MessageStatus.UNREAD);
        return toMessageView(messageStore.save(message));
    }

    public Map<String, Object> createInternalMessage(CreateInternalMessageRequest request, AuthUser authUser) {
        User sender = findUserOrThrow(authUser.userId());
        User recipient = findUserOrThrow(request.recipientUserId());
        validateInternalMessagingPermission(sender, recipient);

        Message message = new Message();
        message.setName(recipient.getFullName());
        message.setEmail(recipient.getEmail());
        message.setPhone(recipient.getPhone());
        message.setSubject(request.subject().trim());
        message.setContent(request.content().trim());
        message.setSummary(buildSummary(request.content()));
        message.setStatus(MessageStatus.UNREAD);
        message.setMessageType(MessageType.INTERNAL);
        message.setRecipientRole(recipient.getRole());
        message.setRecipientUser(recipient.getId());
        message.setSenderUser(sender.getId());
        message.setAssignedTo(sender.getId());
        Message savedMessage = messageStore.save(message);
        notificationEventsService.emitInternalMessageReceived(
            authUser,
            recipient.getId(),
            recipient.getRole().name().toLowerCase(),
            recipient.getFullName(),
            savedMessage.getSubject()
        );
        return toMessageView(savedMessage);
    }

    public List<Map<String, Object>> listRecipients(AuthUser authUser) {
        if (authUser.role() == UserRole.ADMIN) {
            return userStore.findAll().stream()
                .filter(user -> user.isActive() && user.getRole() != UserRole.ADMIN)
                .sorted(Comparator.comparing((User user) -> user.getRole().name()).thenComparing(User::getFullName))
                .map(mapper::toRecipientView)
                .toList();
        }

        if (authUser.role() == UserRole.TEACHER) {
            List<User> admins = userStore.findAll().stream()
                .filter(user -> user.isActive() && user.getRole() == UserRole.ADMIN)
                .toList();
            List<String> ownedCourseIds = courseStore.findByOwner(authUser.userId()).stream().map(Course::getId).toList();
            LinkedHashSet<String> studentIds = enrollmentStore.findAll().stream()
                .filter(enrollment -> ownedCourseIds.contains(enrollment.getCourse()))
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE || enrollment.getStatus() == EnrollmentStatus.COMPLETED)
                .map(Enrollment::getStudent)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            List<User> students = studentIds.stream().map(this::findUserOrThrow).filter(User::isActive).toList();
            return java.util.stream.Stream.concat(admins.stream(), students.stream())
                .sorted(Comparator.comparing(User::getFullName))
                .map(mapper::toRecipientView)
                .toList();
        }

        if (authUser.role() == UserRole.STUDENT) {
            List<User> admins = userStore.findAll().stream()
                .filter(user -> user.isActive() && user.getRole() == UserRole.ADMIN)
                .toList();
            List<String> enrolledCourseIds = enrollmentStore.findByStudentAndStatusInOrderByCreatedAtDesc(
                authUser.userId(),
                List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
            ).stream().map(Enrollment::getCourse).distinct().toList();
            LinkedHashSet<String> teacherIds = courseStore.findAllByIds(enrolledCourseIds).stream()
                .map(Course::getOwner)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
            List<User> teachers = teacherIds.stream().map(this::findUserOrThrow).filter(User::isActive).toList();
            return java.util.stream.Stream.concat(admins.stream(), teachers.stream())
                .sorted(Comparator.comparing(User::getFullName))
                .map(mapper::toRecipientView)
                .toList();
        }

        return List.of();
    }

    public Map<String, Object> markMessage(String messageId, MarkMessageRequest request, AuthUser authUser) {
        Message message = findMessageOrThrow(messageId);
        if (!canViewMessage(authUser, message)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Message not found");
        }

        MessageStatus nextStatus = parseStatus(request.status());
        message.setStatus(nextStatus);
        message.setAssignedTo(authUser.userId());
        if (nextStatus == MessageStatus.READ || nextStatus == MessageStatus.REPLIED) {
            message.setReadAt(Instant.now());
        }
        if (nextStatus == MessageStatus.REPLIED) {
            message.setRepliedAt(Instant.now());
        }
        return toMessageView(messageStore.save(message));
    }

    private boolean canViewMessage(AuthUser authUser, Message message) {
        if (authUser.role() == UserRole.ADMIN) {
            return true;
        }
        return authUser.userId().equals(message.getRecipientUser()) || authUser.userId().equals(message.getAssignedTo());
    }

    private void validateInternalMessagingPermission(User sender, User recipient) {
        if (sender.getRole() == UserRole.ADMIN) {
            return;
        }

        if (sender.getRole() == UserRole.TEACHER) {
            if (recipient.getRole() == UserRole.TEACHER) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Teachers can only message admins or their students");
            }
            if (recipient.getRole() == UserRole.STUDENT) {
                List<String> ownedCourseIds = courseStore.findByOwner(sender.getId()).stream().map(Course::getId).toList();
                boolean hasSharedCourse = enrollmentStore.findAll().stream()
                    .anyMatch(enrollment -> enrollment.getStudent().equals(recipient.getId())
                        && ownedCourseIds.contains(enrollment.getCourse())
                        && (enrollment.getStatus() == EnrollmentStatus.ACTIVE || enrollment.getStatus() == EnrollmentStatus.COMPLETED));
                if (!hasSharedCourse) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Teacher can only message students enrolled in their courses");
                }
            }
            return;
        }

        if (sender.getRole() == UserRole.STUDENT) {
            if (recipient.getRole() == UserRole.STUDENT) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Students can only message admins or teachers of enrolled courses");
            }
            if (recipient.getRole() == UserRole.TEACHER) {
                List<String> enrolledCourseIds = enrollmentStore.findByStudentAndStatusInOrderByCreatedAtDesc(
                    sender.getId(),
                    List.of(EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED)
                ).stream().map(Enrollment::getCourse).toList();
                boolean teacherOwnsEnrolledCourse = courseStore.findAllByIds(enrolledCourseIds).stream()
                    .anyMatch(course -> course.getOwner().equals(recipient.getId()));
                if (!teacherOwnsEnrolledCourse) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "Student can only message teachers who own enrolled courses");
                }
            }
        }
    }

    private Message findMessageOrThrow(String messageId) {
        return messageStore.findById(messageId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
    }

    private User findUserOrThrow(String userId) {
        return userStore.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Map<String, Object> toMessageView(Message message) {
        User assignedTo = message.getAssignedTo() != null ? userStore.findById(message.getAssignedTo()).orElse(null) : null;
        User recipient = message.getRecipientUser() != null ? userStore.findById(message.getRecipientUser()).orElse(null) : null;
        User sender = message.getSenderUser() != null ? userStore.findById(message.getSenderUser()).orElse(null) : null;
        return mapper.toMessageView(message, assignedTo, recipient, sender);
    }

    private String buildSummary(String content) {
        String normalized = content.replaceAll("\\s+", " ").trim();
        return normalized.length() > 140 ? normalized.substring(0, 137) + "..." : normalized;
    }

    private MessageStatus parseStatus(String value) {
        String normalized = value == null || value.isBlank() ? "read" : value.trim().replace('-', '_').toUpperCase(Locale.ROOT);
        if (!normalized.equals("READ") && !normalized.equals("REPLIED")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status must be read or replied");
        }
        return MessageStatus.valueOf(normalized);
    }

    private String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
