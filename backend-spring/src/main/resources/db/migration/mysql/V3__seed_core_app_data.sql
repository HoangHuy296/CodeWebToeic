-- Seed baseline application data for Spring + MySQL hybrid testing.
-- The inserts are guarded so existing local test data is not overwritten.

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'adminmysql001',
    'Admin IvyTS',
    'admin@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'admin',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Admin',
    '0900000000',
    'Seeded admin for Spring + MySQL smoke tests.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'adminmysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'teachermysql001',
    'Teacher One',
    'teacher@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'teacher',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Teacher1',
    '0900000001',
    'Seeded teacher for Spring + MySQL smoke tests.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'teachermysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'studentmysql001',
    'Student One',
    'student1@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'student',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Student1',
    '0900000011',
    'Seeded student for Spring + MySQL smoke tests.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'studentmysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'teacher2mysql001',
    'Teacher Two',
    'teacher2@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'teacher',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Teacher2',
    '0900000002',
    'IELTS/TOEIC coach for seeded MySQL smoke tests.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'teacher2mysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'student2mysql001',
    'Student Two',
    'student2@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'student',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Student2',
    '0900000012',
    'Seeded student for Spring + MySQL role testing.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'student2mysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'student3mysql001',
    'Student Three',
    'student3@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'student',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Student3',
    '0900000013',
    'Additional seeded student for message and enrollment flows.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'student3mysql001');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed001',
    'teachermysql001',
    'TOEIC Sprint 650+',
    'toeic-sprint-650-mysql',
    'Khoa hoc TOEIC cap toc de smoke test tren MySQL.',
    'Noi dung khoa hoc duoc seed de test enrollment, learning, messages va dashboard tren Spring + MySQL.',
    'TOEIC',
    'intermediate',
    1890000.00,
    1490000.00,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',480,'thumbnail','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Starter workbook','url','https://example.com/files/toeic-sprint-workbook.pdf')),
    2,
    1500,
    JSON_ARRAY('toeic','reading','listening'),
    JSON_ARRAY('Lo trinh muc tieu ro rang','Theo doi tien do theo lesson'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed001');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed002',
    'teacher2mysql001',
    'IELTS Launchpad Draft',
    'ielts-launchpad-draft-mysql',
    'Ban nhap khoa hoc IELTS de kiem thu workflow review.',
    'Course draft duoc seed de admin co the review va teacher co the nhan notification sau nay.',
    'IELTS',
    'beginner',
    2190000.00,
    NULL,
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',420,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(),
    1,
    600,
    JSON_ARRAY('ielts','foundation'),
    JSON_ARRAY('Draft review flow'),
    FALSE,
    'pending_review',
    NULL,
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed002');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed001',
    'coursemysqlseed001',
    'Reading strategy setup',
    'reading-strategy-setup',
    'Mo dau cho reading strategy.',
    'Lesson content for reading strategy.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',720,'thumbnail','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
    1,
    TRUE,
    JSON_ARRAY(JSON_OBJECT('title','Slides','url','https://example.com/reading-strategy.pdf')),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed001');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed002',
    'coursemysqlseed001',
    'Listening trap patterns',
    'listening-trap-patterns',
    'Nhan dien bay nghe trong de TOEIC.',
    'Lesson content for listening traps.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',780,'thumbnail','https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=800&q=80'),
    2,
    FALSE,
    JSON_ARRAY(JSON_OBJECT('title','Worksheet','url','https://example.com/listening-traps.pdf')),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed002');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed003',
    'coursemysqlseed002',
    'IELTS warm-up',
    'ielts-warm-up',
    'Lesson draft cho review workflow.',
    'Draft lesson content.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',600,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
    1,
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed003');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed001',
    'studentmysql001',
    'coursemysqlseed001',
    'active',
    50,
    JSON_ARRAY('lessonmysqlseed001'),
    'lessonmysqlseed001',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed001');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed002',
    'student2mysql001',
    'coursemysqlseed001',
    'completed',
    100,
    JSON_ARRAY('lessonmysqlseed001','lessonmysqlseed002'),
    'lessonmysqlseed002',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed002');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed003',
    'student3mysql001',
    'coursemysqlseed002',
    'active',
    0,
    JSON_ARRAY(),
    NULL,
    UTC_TIMESTAMP(),
    NULL,
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed003');

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed001', 'lessonmysqlseed001', 420, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed001' AND lesson_id = 'lessonmysqlseed001'
);

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed002', 'lessonmysqlseed001', 720, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed002' AND lesson_id = 'lessonmysqlseed001'
);

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed002', 'lessonmysqlseed002', 780, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed002' AND lesson_id = 'lessonmysqlseed002'
);

INSERT INTO orders (
    id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at
)
SELECT
    'ordermysqlseed001',
    'studentmysql001',
    'coursemysqlseed001',
    1490000.00,
    'VND',
    'paid',
    'bank_transfer',
    'TXN-SPRING-0001',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ordermysqlseed001');

INSERT INTO orders (
    id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at
)
SELECT
    'ordermysqlseed002',
    'student2mysql001',
    'coursemysqlseed001',
    1490000.00,
    'VND',
    'paid',
    'momo',
    'TXN-SPRING-0002',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ordermysqlseed002');

INSERT INTO blog_posts (
    id, author_id, title, slug, excerpt, content, thumbnail, tags, status, published_at, created_at, updated_at
)
SELECT
    'postmysqlseed001',
    'adminmysql001',
    'Toeic reading pacing framework',
    'toeic-reading-pacing-framework',
    'Framework ngan gon giup hoc vien giu pace trong Reading.',
    'Noi dung bai viet duoc seed de test admin posts page va public list workflow.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY('toeic','reading','strategy'),
    'published',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE id = 'postmysqlseed001');

INSERT INTO blog_posts (
    id, author_id, title, slug, excerpt, content, thumbnail, tags, status, published_at, created_at, updated_at
)
SELECT
    'postmysqlseed002',
    'adminmysql001',
    'Ielts vocabulary checklist',
    'ielts-vocabulary-checklist',
    'Checklist tu vung de hoc vien tu hoc theo tuan.',
    'Seeded draft post for admin editorial workflow.',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    JSON_ARRAY('ielts','vocabulary'),
    'draft',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE id = 'postmysqlseed002');

INSERT INTO messages (
    id, name, email, phone, subject, content, summary, status, message_type, recipient_role,
    recipient_user_id, sender_user_id, assigned_to_id, read_at, replied_at, created_at, updated_at
)
SELECT
    'messagemysqlseed001',
    'Teacher One',
    'teacher@ivyts.dev',
    '0900000001',
    'Lich hoc bo sung',
    'Teacher gui lich hoc bo sung cho hoc vien dang hoc TOEIC Sprint 650+.',
    'Teacher gui lich hoc bo sung cho hoc vien dang hoc TOEIC Sprint 650+.',
    'unread',
    'internal',
    'student',
    'studentmysql001',
    'teachermysql001',
    'teachermysql001',
    NULL,
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE id = 'messagemysqlseed001');

INSERT INTO messages (
    id, name, email, phone, subject, content, summary, status, message_type, recipient_role,
    recipient_user_id, sender_user_id, assigned_to_id, read_at, replied_at, created_at, updated_at
)
SELECT
    'messagemysqlseed002',
    'Admin Team',
    'admin@ivyts.dev',
    NULL,
    'Draft course review',
    'Admin thong bao khoa hoc IELTS draft dang cho teacher bo sung noi dung.',
    'Admin thong bao khoa hoc IELTS draft dang cho teacher bo sung noi dung.',
    'read',
    'internal',
    'teacher',
    'teacher2mysql001',
    'adminmysql001',
    'adminmysql001',
    UTC_TIMESTAMP(),
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE id = 'messagemysqlseed002');

INSERT INTO messages (
    id, name, email, phone, subject, content, summary, status, message_type, recipient_role,
    recipient_user_id, sender_user_id, assigned_to_id, read_at, replied_at, created_at, updated_at
)
SELECT
    'messagemysqlseed003',
    'Student Three',
    'student3@ivyts.dev',
    '0900000013',
    'Can tu van lo trinh',
    'Hoc vien can tu van them lo trinh hoc IELTS foundation.',
    'Hoc vien can tu van them lo trinh hoc IELTS foundation.',
    'replied',
    'internal',
    'admin',
    'adminmysql001',
    'student3mysql001',
    'adminmysql001',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE id = 'messagemysqlseed003');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed001',
    'adminmysql001',
    'TOEIC Free Placement Mini',
    'Free placement mini test seeded for Spring + MySQL smoke tests.',
    'mini-test',
    'intermediate',
    15,
    2,
    'published',
    JSON_ARRAY('Lam bai trong 15 phut','Doc ky tung cau hoi'),
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed001');

INSERT INTO mock_test_questions (
    id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at
)
SELECT
    'mockquestionseed001',
    'mockmysqlseed001',
    'reading',
    'Choose the best word to complete the sentence.',
    'Present perfect is required by the time marker.',
    NULL,
    NULL,
    1,
    1,
    'easy',
    'A',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id = 'mockquestionseed001');

INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed001', 'A', 'has completed', TRUE
WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id = 'mockquestionseed001' AND option_key = 'A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed001', 'B', 'complete', FALSE
WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id = 'mockquestionseed001' AND option_key = 'B');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed001', 'C', 'completed', FALSE
WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id = 'mockquestionseed001' AND option_key = 'C');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed001', 'D', 'completes', FALSE
WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id = 'mockquestionseed001' AND option_key = 'D');
