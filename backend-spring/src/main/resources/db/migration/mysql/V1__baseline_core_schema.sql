-- IvyTS production baseline for MySQL 8.
-- This schema is the main relational foundation for the Spring backend.

CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(64) PRIMARY KEY,
    full_name           VARCHAR(255) NOT NULL,
    email               VARCHAR(191) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(32) NOT NULL DEFAULT 'student',
    avatar_url          TEXT NULL,
    phone               VARCHAR(32) NULL,
    bio                 TEXT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_token       TEXT NULL,
    owned_course_ids    JSON NULL,
    pending_email_change JSON NULL,
    pending_phone_change JSON NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT uq_users_email UNIQUE (email),
    INDEX idx_users_role_active (role, is_active),
    INDEX idx_users_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS courses (
    id                  VARCHAR(64) PRIMARY KEY,
    owner_id            VARCHAR(64) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(191) NOT NULL,
    short_description   TEXT NOT NULL,
    description         LONGTEXT NOT NULL,
    category            VARCHAR(120) NOT NULL,
    level               VARCHAR(32) NOT NULL DEFAULT 'beginner',
    price               DECIMAL(12,2) NOT NULL DEFAULT 0,
    sale_price          DECIMAL(12,2) NULL,
    thumbnail           TEXT NULL,
    intro_video         JSON NULL,
    materials_json      JSON NULL,
    lesson_count        INT NOT NULL DEFAULT 0,
    total_duration      INT NOT NULL DEFAULT 0,
    tags_json           JSON NULL,
    benefits_json       JSON NULL,
    is_published        BOOLEAN NOT NULL DEFAULT FALSE,
    review_status       VARCHAR(32) NOT NULL DEFAULT 'pending_review',
    review_note         TEXT NULL,
    published_at        TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT uq_courses_slug UNIQUE (slug),
    CONSTRAINT fk_courses_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    INDEX idx_courses_category_level_published (category, level, is_published),
    INDEX idx_courses_owner_review (owner_id, review_status, is_published)
);

CREATE TABLE IF NOT EXISTS lessons (
    id                  VARCHAR(64) PRIMARY KEY,
    course_id           VARCHAR(64) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(191) NOT NULL,
    description         TEXT NULL,
    content             LONGTEXT NULL,
    video_json          JSON NULL,
    lesson_order        INT NOT NULL,
    is_preview          BOOLEAN NOT NULL DEFAULT FALSE,
    materials_json      JSON NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    CONSTRAINT uq_lessons_course_order UNIQUE (course_id, lesson_order),
    CONSTRAINT uq_lessons_course_slug UNIQUE (course_id, slug),
    INDEX idx_lessons_course_preview (course_id, is_preview)
);

CREATE TABLE IF NOT EXISTS enrollments (
    id                  VARCHAR(64) PRIMARY KEY,
    student_id          VARCHAR(64) NOT NULL,
    course_id           VARCHAR(64) NOT NULL,
    status              VARCHAR(32) NOT NULL DEFAULT 'active',
    progress_percent    INT NOT NULL DEFAULT 0,
    completed_lesson_ids JSON NULL,
    last_lesson_id      VARCHAR(64) NULL,
    enrolled_at         TIMESTAMP NULL,
    started_at          TIMESTAMP NULL,
    completed_at        TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT uq_enrollments_student_course UNIQUE (student_id, course_id),
    INDEX idx_enrollments_course_status (course_id, status),
    INDEX idx_enrollments_student_status (student_id, status)
);

CREATE TABLE IF NOT EXISTS enrollment_lesson_progress (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    enrollment_id       VARCHAR(64) NOT NULL,
    lesson_id           VARCHAR(64) NOT NULL,
    watched_seconds     INT NOT NULL DEFAULT 0,
    is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at        TIMESTAMP NULL,
    last_accessed_at    TIMESTAMP NULL,
    CONSTRAINT fk_lesson_progress_enrollment FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    CONSTRAINT uq_lesson_progress_enrollment_lesson UNIQUE (enrollment_id, lesson_id),
    INDEX idx_lesson_progress_completed (enrollment_id, is_completed)
);

CREATE TABLE IF NOT EXISTS mock_tests (
    id                  VARCHAR(64) PRIMARY KEY,
    created_by_id       VARCHAR(64) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    type                VARCHAR(32) NOT NULL DEFAULT 'mini-test',
    level               VARCHAR(32) NOT NULL DEFAULT 'beginner',
    duration_minutes    INT NOT NULL,
    question_count      INT NOT NULL DEFAULT 0,
    status              VARCHAR(32) NOT NULL DEFAULT 'draft',
    instructions        JSON NULL,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_course_ids JSON NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_mock_tests_creator FOREIGN KEY (created_by_id) REFERENCES users(id),
    INDEX idx_mock_tests_status_level_type (status, level, type),
    INDEX idx_mock_tests_creator_status (created_by_id, status)
);

CREATE TABLE IF NOT EXISTS mock_test_questions (
    id                  VARCHAR(64) PRIMARY KEY,
    mock_test_id        VARCHAR(64) NOT NULL,
    section_name        VARCHAR(32) NOT NULL DEFAULT 'mixed',
    prompt              LONGTEXT NOT NULL,
    explanation         LONGTEXT NULL,
    audio_url           TEXT NULL,
    image_url           TEXT NULL,
    points              INT NOT NULL DEFAULT 1,
    question_order      INT NOT NULL,
    difficulty_level    VARCHAR(32) NOT NULL DEFAULT 'medium',
    correct_answer      VARCHAR(8) NOT NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_mock_test_questions_test FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id) ON DELETE CASCADE,
    CONSTRAINT uq_mock_test_questions_order UNIQUE (mock_test_id, question_order),
    INDEX idx_mock_test_questions_section (mock_test_id, section_name)
);

CREATE TABLE IF NOT EXISTS mock_test_question_options (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id         VARCHAR(64) NOT NULL,
    option_key          VARCHAR(8) NOT NULL,
    option_text         LONGTEXT NOT NULL,
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES mock_test_questions(id) ON DELETE CASCADE,
    CONSTRAINT uq_question_options_key UNIQUE (question_id, option_key)
);

CREATE TABLE IF NOT EXISTS test_submissions (
    id                  VARCHAR(64) PRIMARY KEY,
    student_id          VARCHAR(64) NOT NULL,
    mock_test_id        VARCHAR(64) NOT NULL,
    score               DECIMAL(6,2) NOT NULL DEFAULT 0,
    total_questions     INT NOT NULL DEFAULT 0,
    correct_answers     INT NOT NULL DEFAULT 0,
    duration_seconds    INT NOT NULL DEFAULT 0,
    submitted_at        TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_test_submissions_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_test_submissions_mock_test FOREIGN KEY (mock_test_id) REFERENCES mock_tests(id),
    INDEX idx_test_submissions_student_date (student_id, submitted_at),
    INDEX idx_test_submissions_test_date (mock_test_id, submitted_at)
);

CREATE TABLE IF NOT EXISTS test_submission_answers (
    id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
    submission_id       VARCHAR(64) NOT NULL,
    question_id         VARCHAR(64) NOT NULL,
    selected_option     VARCHAR(8) NULL,
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_submission_answers_submission FOREIGN KEY (submission_id) REFERENCES test_submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_submission_answers_question FOREIGN KEY (question_id) REFERENCES mock_test_questions(id),
    CONSTRAINT uq_submission_answers_question UNIQUE (submission_id, question_id)
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id                  VARCHAR(64) PRIMARY KEY,
    author_id           VARCHAR(64) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    slug                VARCHAR(191) NOT NULL,
    excerpt             TEXT NULL,
    content             LONGTEXT NOT NULL,
    thumbnail           TEXT NULL,
    tags                JSON NULL,
    status              VARCHAR(32) NOT NULL DEFAULT 'draft',
    published_at        TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_blog_posts_author FOREIGN KEY (author_id) REFERENCES users(id),
    CONSTRAINT uq_blog_posts_slug UNIQUE (slug),
    INDEX idx_blog_posts_status_date (status, published_at)
);

CREATE TABLE IF NOT EXISTS messages (
    id                  VARCHAR(64) PRIMARY KEY,
    name                VARCHAR(255) NULL,
    email               VARCHAR(191) NULL,
    phone               VARCHAR(32) NULL,
    subject             VARCHAR(255) NOT NULL,
    content             LONGTEXT NOT NULL,
    summary             TEXT NULL,
    status              VARCHAR(32) NOT NULL DEFAULT 'unread',
    message_type        VARCHAR(32) NOT NULL DEFAULT 'contact',
    recipient_role      VARCHAR(32) NULL,
    recipient_user_id   VARCHAR(64) NULL,
    sender_user_id      VARCHAR(64) NULL,
    assigned_to_id      VARCHAR(64) NULL,
    read_at             TIMESTAMP NULL,
    replied_at          TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users(id),
    CONSTRAINT fk_messages_assigned_to FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    INDEX idx_messages_type_recipient_created (message_type, recipient_user_id, created_at),
    INDEX idx_messages_status_created (status, created_at)
);

CREATE TABLE IF NOT EXISTS orders (
    id                  VARCHAR(64) PRIMARY KEY,
    student_id          VARCHAR(64) NOT NULL,
    course_id           VARCHAR(64) NOT NULL,
    amount              DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency            VARCHAR(8) NOT NULL DEFAULT 'VND',
    status              VARCHAR(32) NOT NULL DEFAULT 'pending',
    payment_method      VARCHAR(64) NULL,
    transaction_ref     VARCHAR(191) NULL,
    paid_at             TIMESTAMP NULL,
    created_at          TIMESTAMP NULL,
    updated_at          TIMESTAMP NULL,
    CONSTRAINT fk_orders_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_orders_course FOREIGN KEY (course_id) REFERENCES courses(id),
    INDEX idx_orders_status_date (status, created_at),
    INDEX idx_orders_student_status (student_id, status)
);
