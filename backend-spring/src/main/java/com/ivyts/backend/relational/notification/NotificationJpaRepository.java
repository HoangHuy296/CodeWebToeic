package com.ivyts.backend.relational.notification;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, String> {

    List<NotificationEntity> findTop30ByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    long countByRecipientUserIdAndIsReadFalse(String recipientUserId);

    Optional<NotificationEntity> findByIdAndRecipientUserId(String id, String recipientUserId);

    @Modifying
    @Query("""
        update NotificationEntity n
        set n.isRead = true, n.readAt = :readAt
        where n.recipientUserId = :recipientUserId and n.isRead = false
    """)
    int markAllAsRead(@Param("recipientUserId") String recipientUserId, @Param("readAt") Instant readAt);

    @Modifying
    void deleteByRecipientUserId(String recipientUserId);
}
