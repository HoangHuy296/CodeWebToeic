-- EN/VI rollout, Dot 1 (see docs/language-en-vi-plan.md): per-account language preference.
ALTER TABLE users
    ADD COLUMN preferred_language VARCHAR(8) NOT NULL DEFAULT 'vi';
