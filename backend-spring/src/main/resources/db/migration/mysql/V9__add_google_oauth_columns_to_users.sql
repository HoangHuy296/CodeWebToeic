ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(255) NULL;

ALTER TABLE users
    ADD COLUMN google_sub VARCHAR(191) NULL AFTER role,
    ADD COLUMN google_email_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER google_sub,
    ADD COLUMN google_linked_at TIMESTAMP NULL AFTER google_email_verified,
    ADD COLUMN last_login_at TIMESTAMP NULL AFTER refresh_token;

CREATE UNIQUE INDEX uq_users_google_sub ON users (google_sub);
