-- Word-check module ("Kiem Tra" / "On Tap"): typed EN/VI phrase drills, ported from the
-- standalone toeic-web (NestJS + Google Sheet) app. A "set" groups items (column `set_name`,
-- e.g. "Starter 1"); `set_slug` is the URL-safe id ("starter-1"). Grading always happens on
-- the server: the browser never receives `en` / `other_answers` before it submits.

CREATE TABLE word_items (
    id              VARCHAR(64)  NOT NULL,
    set_name        VARCHAR(191) NOT NULL,
    set_slug        VARCHAR(191) NOT NULL,
    en              VARCHAR(500) NOT NULL,
    vi              VARCHAR(500) NOT NULL,
    part            VARCHAR(191) NOT NULL DEFAULT '',
    topic           VARCHAR(191) NOT NULL DEFAULT '',
    note            TEXT NULL,
    other_answers   TEXT NULL,
    example_en      TEXT NULL,
    example_vi      TEXT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_word_items_set_slug ON word_items (set_slug, sort_order);

CREATE TABLE word_scores (
    id                  VARCHAR(64)  NOT NULL,
    set_name            VARCHAR(191) NOT NULL,
    set_slug            VARCHAR(191) NOT NULL,
    student_name        VARCHAR(191) NOT NULL,
    student_id          VARCHAR(64)  NULL,
    mode                VARCHAR(32)  NOT NULL,
    correct_first_try   INT NOT NULL,
    total_answered      INT NOT NULL,
    total_in_set        INT NOT NULL,
    rounds              INT NOT NULL,
    total_attempts      INT NOT NULL,
    duration_seconds    INT NOT NULL,
    finished_at         TIMESTAMP NULL,
    PRIMARY KEY (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_word_scores_set_slug ON word_scores (set_slug, finished_at);

-- Seed: a small "Starter 1" and "Sprinter 1" set so /wordcheck and /review work out of the box.
INSERT INTO word_items (id, set_name, set_slug, en, vi, part, topic, note, other_answers, example_en, example_vi, sort_order, created_at, updated_at) VALUES
('wc-st1-01', 'Starter 1', 'starter-1', 'in advance', 'trước, trước thời hạn', 'Vocab', 'Collocation', 'Thường đứng cuối câu.', NULL, 'Please pay in advance.', 'Vui lòng thanh toán trước.', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-02', 'Starter 1', 'starter-1', 'take place', 'diễn ra', 'Vocab', 'Collocation', NULL, 'happen', 'The meeting will take place tomorrow.', 'Cuộc họp sẽ diễn ra vào ngày mai.', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-03', 'Starter 1', 'starter-1', 'on time', 'đúng giờ', 'Vocab', 'Collocation', NULL, NULL, 'The train arrived on time.', 'Tàu đã đến đúng giờ.', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-04', 'Starter 1', 'starter-1', 'apply for', 'nộp đơn xin', 'Vocab', 'Verb phrase', NULL, NULL, 'She applied for the manager position.', 'Cô ấy đã nộp đơn xin vị trí quản lý.', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-05', 'Starter 1', 'starter-1', 'point out', 'chỉ ra, nêu ra', 'Vocab', 'Verb phrase', NULL, NULL, 'He pointed out the mistake in the report.', 'Anh ấy đã chỉ ra lỗi trong báo cáo.', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-06', 'Starter 1', 'starter-1', 'in charge of', 'phụ trách', 'Vocab', 'Collocation', NULL, NULL, 'She is in charge of the marketing team.', 'Cô ấy phụ trách đội ngũ marketing.', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-07', 'Starter 1', 'starter-1', 'attach', 'đính kèm', 'Vocab', 'Email', NULL, NULL, 'Please attach the file to your e-mail.', 'Vui lòng đính kèm tệp vào email của bạn.', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-08', 'Starter 1', 'starter-1', 'résumé', 'sơ yếu lý lịch', 'Vocab', 'HR', 'Không phân biệt có dấu hay không.', 'resume', 'Please send your résumé before Friday.', 'Vui lòng gửi sơ yếu lý lịch trước thứ Sáu.', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-09', 'Starter 1', 'starter-1', 'reschedule', 'sắp xếp lại lịch', 'Vocab', 'Meeting', NULL, NULL, 'We need to reschedule the appointment.', 'Chúng ta cần sắp xếp lại lịch hẹn.', 9, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-10', 'Starter 1', 'starter-1', 'as soon as possible', 'càng sớm càng tốt', 'Vocab', 'Office', NULL, NULL, 'Please reply as soon as possible.', 'Vui lòng trả lời càng sớm càng tốt.', 10, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-11', 'Starter 1', 'starter-1', 'discount', 'giảm giá', 'Vocab', 'Shopping', NULL, NULL, 'The store offers a 20% discount.', 'Cửa hàng giảm giá 20%.', 11, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-st1-12', 'Starter 1', 'starter-1', 'invoice', 'hóa đơn', 'Vocab', 'Finance', NULL, 'bill', 'The invoice was sent last week.', 'Hóa đơn đã được gửi tuần trước.', 12, UTC_TIMESTAMP(), UTC_TIMESTAMP());

INSERT INTO word_items (id, set_name, set_slug, en, vi, part, topic, note, other_answers, example_en, example_vi, sort_order, created_at, updated_at) VALUES
('wc-sp1-01', 'Sprinter 1', 'sprinter-1', 'negotiate a contract', 'đàm phán hợp đồng', 'Vocab', 'Business', NULL, NULL, 'They negotiated a contract with the supplier.', 'Họ đã đàm phán hợp đồng với nhà cung cấp.', 1, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-02', 'Sprinter 1', 'sprinter-1', 'meet the deadline', 'kịp thời hạn', 'Vocab', 'Project', NULL, NULL, 'The team managed to meet the deadline.', 'Nhóm đã kịp hoàn thành đúng thời hạn.', 2, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-03', 'Sprinter 1', 'sprinter-1', 'quarterly report', 'báo cáo hàng quý', 'Vocab', 'Finance', NULL, NULL, 'The quarterly report is due next Monday.', 'Báo cáo hàng quý phải nộp vào thứ Hai tới.', 3, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-04', 'Sprinter 1', 'sprinter-1', 'shareholder', 'cổ đông', 'Vocab', 'Finance', NULL, NULL, 'Shareholders approved the new budget.', 'Các cổ đông đã phê duyệt ngân sách mới.', 4, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-05', 'Sprinter 1', 'sprinter-1', 'subject to change', 'có thể thay đổi', 'Vocab', 'Notice', NULL, NULL, 'The schedule is subject to change.', 'Lịch trình có thể thay đổi.', 5, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-06', 'Sprinter 1', 'sprinter-1', 'comply with regulations', 'tuân thủ quy định', 'Vocab', 'Compliance', NULL, NULL, 'All staff must comply with regulations.', 'Tất cả nhân viên phải tuân thủ quy định.', 6, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-07', 'Sprinter 1', 'sprinter-1', 'outsource', 'thuê ngoài', 'Vocab', 'Business', NULL, NULL, 'The company decided to outsource its IT support.', 'Công ty quyết định thuê ngoài bộ phận hỗ trợ IT.', 7, UTC_TIMESTAMP(), UTC_TIMESTAMP()),
('wc-sp1-08', 'Sprinter 1', 'sprinter-1', 'a wide range of', 'một loạt, nhiều loại', 'Vocab', 'Collocation', NULL, NULL, 'We offer a wide range of services.', 'Chúng tôi cung cấp nhiều loại dịch vụ.', 8, UTC_TIMESTAMP(), UTC_TIMESTAMP());
