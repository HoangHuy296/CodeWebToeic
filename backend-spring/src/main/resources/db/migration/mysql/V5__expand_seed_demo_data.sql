-- Expand Spring + MySQL demo data so admin dashboard and role workspaces
-- have realistic non-placeholder content during the hybrid migration.

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed003',
    'teacher2mysql001',
    'IELTS Launchpad 5.5+',
    'ielts-launchpad-55-plus',
    'Khoa hoc IELTS can ban da publish de test dashboard, enrollments va revenue tren MySQL.',
    'Noi dung khoa hoc IELTS duoc bo sung vao seed MySQL de admin co revenue va hoc vien co them lua chon hoc that.',
    'IELTS',
    'intermediate',
    1990000.00,
    1390000.00,
    'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',540,'thumbnail','https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','IELTS checklist','url','https://example.com/files/ielts-launchpad-checklist.pdf')),
    2,
    1320,
    JSON_ARRAY('ielts','writing','speaking'),
    JSON_ARRAY('Coaching theo task','Tang phan xa speaking'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed003');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed004',
    'teachermysql001',
    'Business English CRM Essentials',
    'business-english-crm-essentials',
    'Khoa hoc English for work de mo rong du lieu dashboard va student ownership.',
    'Course nay duoc them de seed MySQL co du lieu doanh thu, enrollments va messaging cho ngu can luyen English trong moi truong CRM.',
    'Business English',
    'intermediate',
    2090000.00,
    1450000.00,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',510,'thumbnail','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','CRM phrases workbook','url','https://example.com/files/business-english-crm.pdf')),
    2,
    1260,
    JSON_ARRAY('business-english','crm','email'),
    JSON_ARRAY('Ung dung vao cong viec','Mau email va call scripts'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed004');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed004',
    'coursemysqlseed003',
    'IELTS writing band descriptors',
    'ielts-writing-band-descriptors',
    'Lam quen voi tieu chi cham diem writing.',
    'Lesson content for IELTS writing descriptors.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',660,'thumbnail','https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80'),
    1,
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed004');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed005',
    'coursemysqlseed003',
    'Speaking turnaround practice',
    'speaking-turnaround-practice',
    'Luyen phan xa cho speaking part 2.',
    'Lesson content for speaking turnaround practice.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',660,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
    2,
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed005');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed006',
    'coursemysqlseed004',
    'Client discovery call framework',
    'client-discovery-call-framework',
    'Ngon ngu dung trong discovery call.',
    'Lesson content for client discovery call framework.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',630,'thumbnail','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'),
    1,
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed006');

INSERT INTO lessons (
    id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at
)
SELECT
    'lessonmysqlseed007',
    'coursemysqlseed004',
    'Follow-up email language kit',
    'follow-up-email-language-kit',
    'Mau cau de gui follow-up email tu nhien hon.',
    'Lesson content for follow-up email language kit.',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',630,'thumbnail','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
    2,
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = 'lessonmysqlseed007');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed004',
    'student2mysql001',
    'coursemysqlseed003',
    'active',
    25,
    JSON_ARRAY(),
    'lessonmysqlseed004',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed004');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed005',
    'student3mysql001',
    'coursemysqlseed004',
    'active',
    40,
    JSON_ARRAY('lessonmysqlseed006'),
    'lessonmysqlseed006',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed005');

INSERT INTO enrollments (
    id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id,
    enrolled_at, started_at, completed_at, created_at, updated_at
)
SELECT
    'enrollmysqlseed006',
    'student2mysql001',
    'coursemysqlseed004',
    'completed',
    100,
    JSON_ARRAY('lessonmysqlseed006','lessonmysqlseed007'),
    'lessonmysqlseed007',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id = 'enrollmysqlseed006');

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed004', 'lessonmysqlseed004', 240, FALSE, NULL, UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed004' AND lesson_id = 'lessonmysqlseed004'
);

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed005', 'lessonmysqlseed006', 420, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed005' AND lesson_id = 'lessonmysqlseed006'
);

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed006', 'lessonmysqlseed006', 630, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed006' AND lesson_id = 'lessonmysqlseed006'
);

INSERT INTO enrollment_lesson_progress (
    enrollment_id, lesson_id, watched_seconds, is_completed, completed_at, last_accessed_at
)
SELECT 'enrollmysqlseed006', 'lessonmysqlseed007', 630, TRUE, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM enrollment_lesson_progress
    WHERE enrollment_id = 'enrollmysqlseed006' AND lesson_id = 'lessonmysqlseed007'
);

INSERT INTO orders (
    id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at
)
SELECT
    'ordermysqlseed003',
    'student2mysql001',
    'coursemysqlseed003',
    1390000.00,
    'VND',
    'paid',
    'bank_transfer',
    'TXN-SPRING-0003',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ordermysqlseed003');

INSERT INTO orders (
    id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at
)
SELECT
    'ordermysqlseed004',
    'student3mysql001',
    'coursemysqlseed004',
    1450000.00,
    'VND',
    'paid',
    'card',
    'TXN-SPRING-0004',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ordermysqlseed004');

INSERT INTO orders (
    id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at
)
SELECT
    'ordermysqlseed005',
    'student2mysql001',
    'coursemysqlseed004',
    1450000.00,
    'VND',
    'paid',
    'momo',
    'TXN-SPRING-0005',
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id = 'ordermysqlseed005');
