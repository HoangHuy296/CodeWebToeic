package com.ivyts.backend.notification;

import com.ivyts.backend.security.AuthUser;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class NotificationEventsService {

    private final NotificationGatewayService notificationGatewayService;

    public NotificationEventsService(NotificationGatewayService notificationGatewayService) {
        this.notificationGatewayService = notificationGatewayService;
    }

    public void emitNewUserRegistered(String userId, String email, String fullName) {
        notificationGatewayService.notifyUsers(List.of(userId), input(
            "Dang ky thanh cong",
            "Tai khoan hoc vien da duoc tao va san sang su dung.",
            NotificationSeverity.SUCCESS,
            "auth",
            "student",
            userId,
            metadata("email", email, "fullName", fullName)
        ));

        notificationGatewayService.notifyRoles(List.of("admin"), input(
            "Co user moi dang ky",
            fullName + " vua tao tai khoan moi voi email " + email + ".",
            NotificationSeverity.INFO,
            "system",
            "student",
            userId,
            metadata("email", email, "fullName", fullName)
        ));
    }

    public void emitCourseStatusChanged(
        AuthUser actor,
        String courseId,
        String courseSlug,
        String courseTitle,
        boolean isPublished,
        String ownerId,
        String transition
    ) {
        notificationGatewayService.notifyUsers(List.of(actor.userId()), input(
            actorCourseTitle(actor.role().name().toLowerCase(), transition),
            actorCourseMessage(actor.role().name().toLowerCase(), courseTitle, transition, isPublished),
            NotificationSeverity.SUCCESS,
            "course",
            actor.role().name().toLowerCase(),
            actor.userId(),
            metadata(
                "courseId", courseId,
                "courseTitle", courseTitle,
                "isPublished", isPublished,
                "transition", transition,
                "actionPath", actor.role().name().equals("ADMIN") ? "/admin/courses" : "/courses/" + courseSlug
            )
        ));

        if ("ADMIN".equals(actor.role().name()) && !ownerId.equals(actor.userId()) && !"created".equals(transition)) {
            notificationGatewayService.notifyUsers(List.of(ownerId), input(
                actorCourseTitle("admin", transition),
                actorCourseMessage("admin", courseTitle, transition, isPublished),
                "rejected".equals(transition)
                    ? NotificationSeverity.ERROR
                    : "changes_requested".equals(transition)
                        ? NotificationSeverity.WARNING
                        : NotificationSeverity.SUCCESS,
                "course",
                "admin",
                actor.userId(),
                metadata(
                    "courseId", courseId,
                    "courseTitle", courseTitle,
                    "isPublished", isPublished,
                    "transition", transition,
                    "actionPath", "/courses/" + courseSlug
                )
            ));
        }

        notificationGatewayService.notifyRoles(List.of("admin"), new NotificationDispatchInput(
            adminCourseTitle(actor.role().name().toLowerCase(), transition),
            adminCourseMessage(actor.role().name().toLowerCase(), courseTitle, isPublished, transition),
            isPublished ? NotificationSeverity.SUCCESS : NotificationSeverity.WARNING,
            "course",
            actor.role().name().toLowerCase(),
            actor.userId(),
            metadata(
                "courseId", courseId,
                "courseTitle", courseTitle,
                "isPublished", isPublished,
                "transition", transition,
                "ownerId", ownerId,
                "actionPath", "/admin/courses"
            ),
            List.of("admin"),
            null,
            "ADMIN".equals(actor.role().name()) ? List.of(actor.userId()) : null,
            "system"
        ));
    }

    public void emitEnrollmentCreated(
        String studentUserId,
        String studentName,
        String courseId,
        String courseTitle,
        String ownerId,
        String ownerRole
    ) {
        notificationGatewayService.notifyUsers(List.of(studentUserId), input(
            "Dang ky khoa hoc thanh cong",
            "Ban da dang ky thanh cong khoa hoc \"" + courseTitle + "\".",
            NotificationSeverity.SUCCESS,
            "enrollment",
            "student",
            studentUserId,
            metadata("courseId", courseId, "courseTitle", courseTitle)
        ));

        notificationGatewayService.notifyUsers(List.of(ownerId), input(
            "Co hoc vien moi enroll",
            studentName + " vua dang ky vao khoa hoc \"" + courseTitle + "\".",
            NotificationSeverity.INFO,
            "enrollment",
            "student",
            studentUserId,
            metadata("courseId", courseId, "courseTitle", courseTitle)
        ));

        notificationGatewayService.notifyRoles(List.of("admin"), new NotificationDispatchInput(
            "He thong co enrollment moi",
            studentName + " vua enroll khoa hoc \"" + courseTitle + "\".",
            NotificationSeverity.INFO,
            "system",
            "student",
            studentUserId,
            metadata("courseId", courseId, "courseTitle", courseTitle, "ownerId", ownerId),
            List.of("admin"),
            null,
            "admin".equals(ownerRole) ? List.of(ownerId) : null,
            "system"
        ));
    }

    public void emitInternalMessageReceived(
        AuthUser sender,
        String recipientUserId,
        String recipientRole,
        String recipientName,
        String subject
    ) {
        notificationGatewayService.notifyUsers(List.of(sender.userId()), input(
            "Gui tin nhan thanh cong",
            "Tin nhan \"" + subject + "\" da duoc gui toi " + recipientName + ".",
            NotificationSeverity.SUCCESS,
            "message",
            sender.role().name().toLowerCase(),
            sender.userId(),
            metadata(
                "subject", subject,
                "recipientName", recipientName,
                "recipientRole", recipientRole,
                "actionPath", messageActionPath(sender.role().name().toLowerCase())
            )
        ));

        notificationGatewayService.notifyUsers(List.of(recipientUserId), input(
            "Ban co tin nhan moi",
            sender.email() + " vua gui mot tin nhan moi: \"" + subject + "\".",
            NotificationSeverity.INFO,
            "message",
            sender.role().name().toLowerCase(),
            sender.userId(),
            metadata(
                "subject", subject,
                "recipientName", recipientName,
                "actionPath", messageActionPath(recipientRole)
            )
        ));
    }

    public void emitPostCreated(AuthUser actor, String postId, String postTitle, String status) {
        notificationGatewayService.notifyUsers(List.of(actor.userId()), input(
            "Bai viet da duoc tao",
            "Bai viet \"" + postTitle + "\" da duoc khoi tao thanh cong.",
            NotificationSeverity.SUCCESS,
            "post",
            actor.role().name().toLowerCase(),
            actor.userId(),
            metadata("postId", postId, "postTitle", postTitle, "status", status)
        ));

        notificationGatewayService.notifyRoles(List.of("admin"), new NotificationDispatchInput(
            "Co post moi duoc tao",
            "Post \"" + postTitle + "\" da duoc tao voi trang thai " + status + ".",
            NotificationSeverity.INFO,
            "system",
            actor.role().name().toLowerCase(),
            actor.userId(),
            metadata("postId", postId, "postTitle", postTitle, "status", status),
            List.of("admin"),
            null,
            "ADMIN".equals(actor.role().name()) ? List.of(actor.userId()) : null,
            "system"
        ));
    }

    private NotificationDispatchInput input(
        String title,
        String message,
        NotificationSeverity severity,
        String entityType,
        String actorRole,
        String actorUserId,
        Map<String, Object> metadata
    ) {
        return new NotificationDispatchInput(
            title,
            message,
            severity,
            entityType,
            actorRole,
            actorUserId,
            metadata,
            null,
            null,
            null,
            "system"
        );
    }

    private Map<String, Object> metadata(Object... values) {
        Map<String, Object> data = new LinkedHashMap<>();
        for (int index = 0; index < values.length; index += 2) {
            data.put(String.valueOf(values[index]), values[index + 1]);
        }
        return data;
    }

    private String messageActionPath(String role) {
        return switch (role) {
            case "admin" -> "/admin/messages";
            case "teacher" -> "/teacher/messages";
            default -> "/student/messages";
        };
    }

    private String actorCourseTitle(String role, String transition) {
        return switch (transition) {
            case "created" -> "Tao khoa hoc thanh cong";
            case "published" -> "Xuat ban khoa hoc thanh cong";
            case "draft" -> "Chuyen khoa hoc ve draft";
            case "changes_requested" -> "Yeu cau giang vien chinh sua";
            case "rejected" -> "Tu choi khoa hoc";
            default -> "Cap nhat khoa hoc thanh cong";
        };
    }

    private String actorCourseMessage(String role, String courseTitle, String transition, boolean isPublished) {
        if ("created".equals(transition) && "teacher".equals(role)) {
            return "Khoa hoc \"" + courseTitle + "\" da duoc tao o trang thai draft va da gui admin de phe duyet.";
        }
        if ("published".equals(transition)) {
            return "Khoa hoc \"" + courseTitle + "\" da duoc xuat ban thanh cong.";
        }
        if ("draft".equals(transition)) {
            return "Khoa hoc \"" + courseTitle + "\" da duoc chuyen ve nhap.";
        }
        if ("changes_requested".equals(transition)) {
            return "Admin da yeu cau giang vien chinh sua khoa hoc \"" + courseTitle + "\".";
        }
        if ("rejected".equals(transition)) {
            return "Khoa hoc \"" + courseTitle + "\" da bi tu choi.";
        }
        if ("teacher".equals(role) && !isPublished) {
            return "Khoa hoc \"" + courseTitle + "\" da duoc cap nhat va gui lai admin de phe duyet.";
        }
        return "Khoa hoc \"" + courseTitle + "\" da duoc cap nhat thanh cong.";
    }

    private String adminCourseTitle(String role, String transition) {
        if ("created".equals(transition) && "teacher".equals(role)) {
            return "Giang vien vua tao khoa hoc moi";
        }
        if ("updated".equals(transition) && "teacher".equals(role)) {
            return "Giang vien da gui lai khoa hoc de phe duyet";
        }
        if ("created".equals(transition)) {
            return "Co khoa hoc moi duoc tao";
        }
        if ("published".equals(transition)) {
            return "Khoa hoc da duoc xuat ban";
        }
        if ("draft".equals(transition)) {
            return "Khoa hoc da chuyen ve draft";
        }
        return "Khoa hoc da duoc cap nhat";
    }

    private String adminCourseMessage(String role, String courseTitle, boolean isPublished, String transition) {
        if ("created".equals(transition) && "teacher".equals(role)) {
            return "Giang vien vua tao khoa hoc \"" + courseTitle + "\" o trang thai draft. Admin can review, chinh sua hoac publish.";
        }
        if ("updated".equals(transition) && "teacher".equals(role)) {
            return "Giang vien da cap nhat khoa hoc \"" + courseTitle + "\" va gui lai admin de phe duyet.";
        }
        if ("created".equals(transition)) {
            return "Khoa hoc \"" + courseTitle + "\" vua duoc tao thanh cong.";
        }
        if ("changes_requested".equals(transition)) {
            return "Admin da yeu cau giang vien chinh sua khoa hoc \"" + courseTitle + "\".";
        }
        if ("rejected".equals(transition)) {
            return "Khoa hoc \"" + courseTitle + "\" da bi tu choi.";
        }
        return courseTitle + " hien dang o trang thai " + (isPublished ? "published" : "draft") + ".";
    }
}
