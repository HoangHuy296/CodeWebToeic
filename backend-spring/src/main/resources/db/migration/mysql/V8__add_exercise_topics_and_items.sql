CREATE TABLE IF NOT EXISTS exercise_topics (
    id              VARCHAR(64) PRIMARY KEY,
    slug            VARCHAR(191) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    short_label     VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    accent          VARCHAR(255) NOT NULL,
    keywords_json   JSON NULL,
    sections_json   JSON NULL,
    created_at      TIMESTAMP NULL,
    updated_at      TIMESTAMP NULL,
    CONSTRAINT uq_exercise_topics_slug UNIQUE (slug)
);

ALTER TABLE mock_tests
    ADD COLUMN catalog_kind VARCHAR(32) NOT NULL DEFAULT 'mock-test' AFTER assigned_course_ids;

ALTER TABLE mock_tests
    ADD COLUMN exercise_topic_slug VARCHAR(191) NULL AFTER catalog_kind;

ALTER TABLE mock_tests
    ADD COLUMN exercise_pack_slug VARCHAR(191) NULL AFTER exercise_topic_slug;

CREATE INDEX idx_mock_tests_catalog_kind ON mock_tests (catalog_kind, status);
CREATE INDEX idx_mock_tests_exercise_topic_pack ON mock_tests (exercise_topic_slug, exercise_pack_slug);

INSERT INTO exercise_topics (
    id, slug, label, short_label, description, accent, keywords_json, sections_json, created_at, updated_at
) VALUES
(
    'extopic001',
    'grammar-by-topic',
    'Bai tap theo chu diem ngu phap',
    'Chu diem ngu phap',
    'Tong hop bai tap theo tung chu diem ngu phap TOEIC va IELTS de hoc vien luyen chuyen sau tung manh kien thuc.',
    'from-sky-500/20 via-cyan-400/10 to-emerald-400/20',
    JSON_ARRAY('grammar', 'ngu phap', 'practice set', 'mini test'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'tenses',
            'title', 'Thi dong tu',
            'description', 'Present, past, perfect, passive va cac bai tap bien doi cau.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'present-tenses', 'title', 'Thi hien tai', 'summary', '15 cau ve hien tai don, tiep dien va hoan thanh.'),
                JSON_OBJECT('slug', 'passive-voice', 'title', 'Cau bi dong', 'summary', 'Luyen nhanh active - passive trong ngu canh cong viec.')
            )
        ),
        JSON_OBJECT(
            'id', 'relative-clauses',
            'title', 'Menh de quan he',
            'description', 'Who, whom, whose, which, that trong ngu canh hoc thuat va doanh nghiep.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'relative-basic', 'title', 'Nen tang', 'summary', 'Rut gon va noi cau bang dai tu quan he.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic002',
    'grammar-by-test-pack',
    'Bai tap ngu phap theo bo de',
    'Ngu phap theo bo de',
    'Phan ngu phap duoc dong goi theo bo de va nam thi de hoc vien luyen theo tung de sat de thi that.',
    'from-violet-500/20 via-fuchsia-400/10 to-rose-400/20',
    JSON_ARRAY('grammar', 'full test', 'mini test', 'toeic'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'toeic-2026',
            'title', 'Bo de TOEIC 2026',
            'description', 'Chia theo bo 1, bo 2, bo 3 voi cau hoi sentence completion chuan doanh nghiep.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'toeic-2026-set-1', 'title', 'Bo 1', 'summary', '15 cau sentence completion va error recognition.'),
                JSON_OBJECT('slug', 'toeic-2026-set-2', 'title', 'Bo 2', 'summary', 'Cac cau ngu phap cho meeting, finance va HR.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic003',
    'vocabulary-by-test-pack',
    'Bai tap tu vung theo bo de',
    'Tu vung theo bo de',
    'Tap trung vao collocations, word families va business vocabulary theo tung bo de TOEIC/IELTS.',
    'from-amber-500/20 via-orange-400/10 to-rose-400/20',
    JSON_ARRAY('vocabulary', 'reading', 'practice set', 'ielts', 'toeic'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'business-vocabulary',
            'title', 'Tu vung business core',
            'description', 'Procurement, logistics, HR, accounting, customer service va sales.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'business-pack-1', 'title', 'Business pack 1', 'summary', 'Email, meeting, schedule, project status.'),
                JSON_OBJECT('slug', 'business-pack-2', 'title', 'Business pack 2', 'summary', 'Marketing, campaign, shipment, budget.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic004',
    'reading-by-skill',
    'Bai tap reading theo ky nang',
    'Reading theo ky nang',
    'Tong hop bai tap reading theo ky nang scan, skim, paraphrase va tim evidence trong van ban TOEIC/IELTS.',
    'from-cyan-500/20 via-sky-400/10 to-blue-400/20',
    JSON_ARRAY('reading', 'practice set', 'mini test', 'toeic', 'ielts'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'scan-skim',
            'title', 'Scan va skim',
            'description', 'Doc nhanh de tim thong tin, y chinh va vi tri evidence.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'scan-pack-1', 'title', 'Scan pack 1', 'summary', 'Loc ngay date, names, prices va deadlines.'),
                JSON_OBJECT('slug', 'skim-pack-1', 'title', 'Skim pack 1', 'summary', 'Nhan dien topic sentence va summary line.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic005',
    'listening-by-skill',
    'Bai tap listening theo ky nang',
    'Listening theo ky nang',
    'Tap trung vao distractor, note-taking, short response va conference talk trong de TOEIC.',
    'from-emerald-500/20 via-teal-400/10 to-cyan-400/20',
    JSON_ARRAY('listening', 'mini test', 'full test', 'toeic'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'distractors',
            'title', 'Distractor patterns',
            'description', 'Nhan dien dap an nghe co ve quen tai nhung khong dung.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'distractor-pack-1', 'title', 'Distractor pack 1', 'summary', 'Part 2 question-response voi bay ve am va keyword.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic006',
    'writing-by-task',
    'Bai tap writing theo dang task',
    'Writing theo task',
    'Bai tap nho cho thesis sentence, idea development, cohesion va business email writing.',
    'from-rose-500/20 via-orange-400/10 to-amber-400/20',
    JSON_ARRAY('writing', 'practice set', 'ielts', 'business-english'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'ielts-task-2',
            'title', 'IELTS Task 2',
            'description', 'Thesis, topic sentence, example support va conclusion.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'task2-thesis', 'title', 'Task 2 thesis', 'summary', 'Luyen viet thesis sentence ro position.')
            )
        )
    ),
    NOW(), NOW()
),
(
    'extopic007',
    'mixed-skill-sprints',
    'Bai tap tong hop theo sprint',
    'Sprint tong hop',
    'Nhung bo bai tap ngan ket hop grammar, reading, listening va vocabulary de hoc vien luyen theo sprint 15-20 phut.',
    'from-indigo-500/20 via-blue-400/10 to-cyan-400/20',
    JSON_ARRAY('mixed', 'mini test', 'practice set', 'full test'),
    JSON_ARRAY(
        JSON_OBJECT(
            'id', 'weekly-sprints',
            'title', 'Weekly sprints',
            'description', 'Bo bai tong hop cho nhung ngay can luyen nhanh de giu nhip hoc.',
            'packs', JSON_ARRAY(
                JSON_OBJECT('slug', 'sprint-week-1', 'title', 'Sprint week 1', 'summary', 'Grammar + reading + vocabulary trong 15 phut.'),
                JSON_OBJECT('slug', 'sprint-week-2', 'title', 'Sprint week 2', 'summary', 'Listening + grammar + error log review trong 20 phut.')
            )
        )
    ),
    NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    short_label = VALUES(short_label),
    description = VALUES(description),
    accent = VALUES(accent),
    keywords_json = VALUES(keywords_json),
    sections_json = VALUES(sections_json),
    updated_at = NOW();

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, catalog_kind, exercise_topic_slug, exercise_pack_slug, created_at, updated_at
) VALUES
(
    'exerciseitem001', 'adminmysql001', 'Present Tense Quick Drill', 'Bai luyen tap ngu phap nhanh cho thi hien tai.',
    'practice-set', 'beginner', 12, 1, 'published',
    JSON_ARRAY('Hoan thanh trong 10-12 phut', 'Tap trung vao dau hieu thi va word form'),
    FALSE, JSON_ARRAY(), 'exercise', 'grammar-by-topic', 'present-tenses', NOW(), NOW()
),
(
    'exerciseitem002', 'adminmysql001', 'Passive Voice Office Pack', 'Bai tap cau bi dong trong email va quy trinh van phong.',
    'practice-set', 'intermediate', 15, 1, 'published',
    JSON_ARRAY('Doc ky context truoc khi chon dap an'),
    FALSE, JSON_ARRAY(), 'exercise', 'grammar-by-topic', 'passive-voice', NOW(), NOW()
),
(
    'exerciseitem003', 'adminmysql001', 'Business Vocabulary Sprint', 'Bo bai tap tu vung business cho CRM, sales va meetings.',
    'mini-test', 'intermediate', 15, 1, 'published',
    JSON_ARRAY('Tap trung vao collocations va context'),
    TRUE, JSON_ARRAY(), 'exercise', 'vocabulary-by-test-pack', 'business-pack-1', NOW(), NOW()
),
(
    'exerciseitem004', 'adminmysql001', 'Reading Scan Speed Pack', 'Bai tap reading scan/skim de tim thong tin nhanh.',
    'practice-set', 'beginner', 14, 1, 'published',
    JSON_ARRAY('Su dung keyword scanning de tim evidence'),
    FALSE, JSON_ARRAY(), 'exercise', 'reading-by-skill', 'scan-pack-1', NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    type = VALUES(type),
    level = VALUES(level),
    duration_minutes = VALUES(duration_minutes),
    question_count = VALUES(question_count),
    status = VALUES(status),
    instructions = VALUES(instructions),
    is_featured = VALUES(is_featured),
    assigned_course_ids = VALUES(assigned_course_ids),
    catalog_kind = VALUES(catalog_kind),
    exercise_topic_slug = VALUES(exercise_topic_slug),
    exercise_pack_slug = VALUES(exercise_pack_slug),
    updated_at = NOW();

INSERT INTO mock_test_questions (
    id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at
) VALUES
('exercisequestion001', 'exerciseitem001', 'reading', 'She usually ____ the weekly report before 9 AM.', 'Use the present simple for routines.', NULL, NULL, 1, 1, 'easy', 'A', NOW(), NOW()),
('exercisequestion002', 'exerciseitem002', 'reading', 'The contract ____ by legal before it was sent to the client.', 'The sentence needs the passive past form.', NULL, NULL, 1, 1, 'medium', 'B', NOW(), NOW()),
('exercisequestion003', 'exerciseitem003', 'reading', 'Our sales team needs a stronger customer ____ to improve retention.', 'Choose the collocation that fits CRM context.', NULL, NULL, 1, 1, 'medium', 'C', NOW(), NOW()),
('exercisequestion004', 'exerciseitem004', 'reading', 'According to the notice, when will the system maintenance begin?', 'Scan for the specific time reference.', NULL, NULL, 1, 1, 'easy', 'D', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    prompt = VALUES(prompt),
    explanation = VALUES(explanation),
    points = VALUES(points),
    difficulty_level = VALUES(difficulty_level),
    correct_answer = VALUES(correct_answer),
    updated_at = NOW();

INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct) VALUES
('exercisequestion001', 'A', 'submits', TRUE),
('exercisequestion001', 'B', 'submitted', FALSE),
('exercisequestion001', 'C', 'submitting', FALSE),
('exercisequestion001', 'D', 'submit', FALSE),
('exercisequestion002', 'A', 'reviews', FALSE),
('exercisequestion002', 'B', 'was reviewed', TRUE),
('exercisequestion002', 'C', 'reviewing', FALSE),
('exercisequestion002', 'D', 'has review', FALSE),
('exercisequestion003', 'A', 'deadline', FALSE),
('exercisequestion003', 'B', 'shipment', FALSE),
('exercisequestion003', 'C', 'relationship', TRUE),
('exercisequestion003', 'D', 'campus', FALSE),
('exercisequestion004', 'A', 'At 7:00 AM', FALSE),
('exercisequestion004', 'B', 'At noon', FALSE),
('exercisequestion004', 'C', 'At 5:30 PM', FALSE),
('exercisequestion004', 'D', 'At 9:00 PM', TRUE)
ON DUPLICATE KEY UPDATE
    option_text = VALUES(option_text),
    is_correct = VALUES(is_correct);
