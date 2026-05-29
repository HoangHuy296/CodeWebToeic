CREATE TABLE IF NOT EXISTS notifications (
    id                VARCHAR(64) PRIMARY KEY,
    recipient_user_id VARCHAR(64) NOT NULL,
    title             VARCHAR(255) NOT NULL,
    message           LONGTEXT NOT NULL,
    severity          VARCHAR(32) NOT NULL,
    entity_type       VARCHAR(32) NOT NULL,
    channel           VARCHAR(32) NOT NULL DEFAULT 'system',
    actor_role        VARCHAR(32) NULL,
    actor_user_id     VARCHAR(64) NULL,
    metadata_json     LONGTEXT NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    read_at           TIMESTAMP NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_recipient_created (recipient_user_id, created_at DESC),
    INDEX idx_notifications_recipient_unread (recipient_user_id, is_read)
);
