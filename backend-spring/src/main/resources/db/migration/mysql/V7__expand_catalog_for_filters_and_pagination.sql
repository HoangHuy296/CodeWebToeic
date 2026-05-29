-- Expand catalog data so list pages, filters, sorting and pagination
-- can be exercised with non-placeholder records on Spring + MySQL.

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'student4mysql001',
    'Student Four',
    'student4@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'student',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Student4',
    '0900000014',
    'Seeded student for pagination and roster checks.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'student4mysql001');

INSERT INTO users (
    id, full_name, email, password_hash, role, avatar_url, phone, bio, is_active, created_at, updated_at
)
SELECT
    'student5mysql001',
    'Student Five',
    'student5@ivyts.dev',
    '$2b$10$xGwJgEoKUFNWIEX.i/9J7evUyxF.CLpGl78/ljlW5riwSQjS1xuYu',
    'student',
    'https://api.dicebear.com/7.x/adventurer/png?seed=Student5',
    '0900000015',
    'Seeded student for message, result and filter checks.',
    TRUE,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'student5mysql001');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed005',
    'teachermysql001',
    'TOEIC Reading Accelerator',
    'toeic-reading-accelerator',
    'Tang toc do doc va giu do chinh xac cho Part 6 va Part 7.',
    'Khoa hoc seed bo sung de trang /courses co du lieu cho filter category, level va pagination.',
    'TOEIC',
    'beginner',
    1590000.00,
    1190000.00,
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',420,'thumbnail','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Reading drills','url','https://example.com/files/reading-accelerator.pdf')),
    2,
    1080,
    JSON_ARRAY('toeic','reading','speed'),
    JSON_ARRAY('Tang toc do scan','Giam loi paraphrase'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed005');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed006',
    'teacher2mysql001',
    'IELTS Speaking Booster 6.5+',
    'ielts-speaking-booster-65-plus',
    'Tap trung phan xa speaking part 2 va part 3 cho muc tieu 6.5+.',
    'Them du lieu speaking de hoc vien co nhieu category va level khi loc khoa hoc.',
    'IELTS',
    'advanced',
    2290000.00,
    1690000.00,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',510,'thumbnail','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Speaking frames','url','https://example.com/files/speaking-booster.pdf')),
    2,
    1140,
    JSON_ARRAY('ielts','speaking','fluency'),
    JSON_ARRAY('Mau cau tra loi nhanh','Bo tu vung theo chu de'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed006');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed007',
    'teachermysql001',
    'Grammar Clinic For Work',
    'grammar-clinic-for-work',
    'On lai ngu phap hay gap trong email, meeting va CRM workflow.',
    'Course business grammar de phan category co them mau va teacher co them course published.',
    'Business English',
    'intermediate',
    1490000.00,
    990000.00,
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',390,'thumbnail','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Grammar checklists','url','https://example.com/files/grammar-clinic.pdf')),
    2,
    960,
    JSON_ARRAY('grammar','business-english','crm'),
    JSON_ARRAY('Gui email tu nhien hon','On lai menh de va verb forms'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed007');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed008',
    'teacher2mysql001',
    'TOEIC Listening Lab',
    'toeic-listening-lab',
    'Kho bai nghe theo trap patterns va note-taking cho listening.',
    'Course listening them vao seed de mock-test assigned co them course mapping da dang.',
    'TOEIC',
    'intermediate',
    1790000.00,
    1290000.00,
    'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',450,'thumbnail','https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Listening workbook','url','https://example.com/files/listening-lab.pdf')),
    2,
    1020,
    JSON_ARRAY('toeic','listening','note-taking'),
    JSON_ARRAY('Nhan dien distractor','Xay mau note gon'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed008');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed009',
    'teachermysql001',
    'Email Writing Essentials',
    'email-writing-essentials',
    'Xay thoi quen viet email ro, gon va dung van phong.',
    'Them du lieu writing cho filter va landing page business English.',
    'Business English',
    'advanced',
    1390000.00,
    1090000.00,
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',360,'thumbnail','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Email templates','url','https://example.com/files/email-writing.pdf')),
    1,
    540,
    JSON_ARRAY('writing','email','business-english'),
    JSON_ARRAY('Template theo tinh huong','Sửa loi grammar va tone'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed009');

INSERT INTO courses (
    id, owner_id, title, slug, short_description, description, category, level, price, sale_price,
    thumbnail, intro_video, materials_json, lesson_count, total_duration, tags_json, benefits_json,
    is_published, review_status, review_note, published_at, created_at, updated_at
)
SELECT
    'coursemysqlseed010',
    'teacher2mysql001',
    'IELTS Writing Task Lab',
    'ielts-writing-task-lab',
    'Luyen task 1, task 2 theo bo task va khung giai thich mau.',
    'Course writing them vao seed de student co them khoa hoc IELTS nang cao va de teacher filter du lieu tot hon.',
    'IELTS',
    'intermediate',
    2390000.00,
    1790000.00,
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',600,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
    JSON_ARRAY(JSON_OBJECT('title','Task response pack','url','https://example.com/files/ielts-writing-lab.pdf')),
    2,
    1200,
    JSON_ARRAY('ielts','writing','task2'),
    JSON_ARRAY('Khung y tuong theo topic','Sửa coherence va cohesion'),
    TRUE,
    'approved',
    NULL,
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = 'coursemysqlseed010');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed008','coursemysqlseed005','Reading scan anchors','reading-scan-anchors','Xac dinh anchor words trong Part 7.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',540,'thumbnail','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed008');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed009','coursemysqlseed005','Paraphrase elimination','paraphrase-elimination','Loai tru dap an paraphrase sai.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',540,'thumbnail','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'),
       2,FALSE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed009');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed010','coursemysqlseed006','Cue cards and fillers','cue-cards-and-fillers','Tao phan xa va filler tu nhien.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',600,'thumbnail','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed010');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed011','coursemysqlseed006','Part 3 follow-up loops','part-3-follow-up-loops','Tao logic tra loi part 3.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',540,'thumbnail','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'),
       2,FALSE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed011');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed012','coursemysqlseed007','Verb forms in emails','verb-forms-in-emails','On lai verb forms trong email.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',480,'thumbnail','https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed012');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed013','coursemysqlseed008','Trap pattern drills','trap-pattern-drills','Tong hop trap pattern part 2 va 3.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',510,'thumbnail','https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed013');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed014','coursemysqlseed009','Tone and clarity in follow-up','tone-and-clarity-in-follow-up','Luyen tone lich su va ro y.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',360,'thumbnail','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed014');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed015','coursemysqlseed010','Task 2 idea scaffolds','task-2-idea-scaffolds','Tao bo khung y tuong task 2.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',620,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
       1,TRUE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed015');

INSERT INTO lessons (id, course_id, title, slug, description, content, video_json, lesson_order, is_preview, materials_json, created_at, updated_at)
SELECT 'lessonmysqlseed016','coursemysqlseed010','Task 1 comparison patterns','task-1-comparison-patterns','So sanh xu huong va so lieu.','Seed lesson content.',
       JSON_OBJECT('videoUrl','https://www.youtube.com/watch?v=dQw4w9WgXcQ','videoProvider','youtube','duration',580,'thumbnail','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=800&q=80'),
       2,FALSE,JSON_ARRAY(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id='lessonmysqlseed016');

INSERT INTO enrollments (id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id, enrolled_at, started_at, completed_at, created_at, updated_at)
SELECT 'enrollmysqlseed007','student4mysql001','coursemysqlseed005','active',20,JSON_ARRAY(),'lessonmysqlseed008',UTC_TIMESTAMP(),UTC_TIMESTAMP(),NULL,UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id='enrollmysqlseed007');

INSERT INTO enrollments (id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id, enrolled_at, started_at, completed_at, created_at, updated_at)
SELECT 'enrollmysqlseed008','student5mysql001','coursemysqlseed006','active',35,JSON_ARRAY('lessonmysqlseed010'),'lessonmysqlseed010',UTC_TIMESTAMP(),UTC_TIMESTAMP(),NULL,UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id='enrollmysqlseed008');

INSERT INTO enrollments (id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id, enrolled_at, started_at, completed_at, created_at, updated_at)
SELECT 'enrollmysqlseed009','studentmysql001','coursemysqlseed007','completed',100,JSON_ARRAY('lessonmysqlseed012'),'lessonmysqlseed012',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id='enrollmysqlseed009');

INSERT INTO enrollments (id, student_id, course_id, status, progress_percent, completed_lesson_ids, last_lesson_id, enrolled_at, started_at, completed_at, created_at, updated_at)
SELECT 'enrollmysqlseed010','student2mysql001','coursemysqlseed008','active',10,JSON_ARRAY(),'lessonmysqlseed013',UTC_TIMESTAMP(),UTC_TIMESTAMP(),NULL,UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM enrollments WHERE id='enrollmysqlseed010');

INSERT INTO orders (id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at)
SELECT 'ordermysqlseed006','student4mysql001','coursemysqlseed005',1190000.00,'VND','paid','bank_transfer','TXN-SPRING-0006',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id='ordermysqlseed006');

INSERT INTO orders (id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at)
SELECT 'ordermysqlseed007','student5mysql001','coursemysqlseed006',1690000.00,'VND','paid','card','TXN-SPRING-0007',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id='ordermysqlseed007');

INSERT INTO orders (id, student_id, course_id, amount, currency, status, payment_method, transaction_ref, paid_at, created_at, updated_at)
SELECT 'ordermysqlseed008','studentmysql001','coursemysqlseed007',990000.00,'VND','paid','momo','TXN-SPRING-0008',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE id='ordermysqlseed008');

INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content, thumbnail, tags, status, published_at, created_at, updated_at, seo_description)
SELECT 'postmysqlseed003','adminmysql001','Toeic listening note-taking system','toeic-listening-note-taking-system','He thong ghi note nhanh cho cac cau hoi nghe de cao.','Noi dung seeded cho admin posts filter va history.','https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1200&q=80',JSON_ARRAY('toeic','listening','notes'),'published',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),'Seeded SEO description for listening note-taking.'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE id='postmysqlseed003');

INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content, thumbnail, tags, status, published_at, created_at, updated_at, seo_description)
SELECT 'postmysqlseed004','adminmysql001','Business email tone checklist','business-email-tone-checklist','Checklist de soat tone email lich su va ro rang.','Noi dung seeded cho posts list va admin filtering.','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',JSON_ARRAY('business-english','email'),'published',UTC_TIMESTAMP(),UTC_TIMESTAMP(),UTC_TIMESTAMP(),'Seeded SEO description for business email tone.'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE id='postmysqlseed004');

INSERT INTO blog_posts (id, author_id, title, slug, excerpt, content, thumbnail, tags, status, published_at, created_at, updated_at, seo_description)
SELECT 'postmysqlseed005','adminmysql001','Ielts writing feedback loop','ielts-writing-feedback-loop','Cach hoc vien dung feedback de nang band writing on dinh hon.','Noi dung seeded cho posts list va admin filtering.','https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',JSON_ARRAY('ielts','writing'),'draft',NULL,UTC_TIMESTAMP(),UTC_TIMESTAMP(),'Seeded SEO description for IELTS writing feedback.'
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE id='postmysqlseed005');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed002',
    'adminmysql001',
    'TOEIC Reading Snapshot',
    'Mini test reading free cho hoc vien loc theo level beginner.',
    'mini-test',
    'beginner',
    12,
    1,
    'published',
    JSON_ARRAY('Lam bai trong 12 phut'),
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed002');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed003',
    'adminmysql001',
    'IELTS Writing Warmup',
    'Practice set cho writing fundamentals.',
    'practice-set',
    'intermediate',
    20,
    1,
    'published',
    JSON_ARRAY('Doc ky prompt truoc khi chon'),
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed003');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed004',
    'teachermysql001',
    'Reading Accelerator Checkpoint',
    'Bai on tap theo khoa hoc TOEIC Reading Accelerator.',
    'practice-set',
    'beginner',
    18,
    1,
    'published',
    JSON_ARRAY('Tap trung phan doc'),
    FALSE,
    JSON_ARRAY('coursemysqlseed005'),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed004');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed005',
    'teacher2mysql001',
    'Speaking Booster Drill',
    'Mini speaking drill duoc gan voi khoa hoc IELTS speaking.',
    'mini-test',
    'advanced',
    14,
    1,
    'published',
    JSON_ARRAY('Tra loi gon va ro'),
    FALSE,
    JSON_ARRAY('coursemysqlseed006'),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed005');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed006',
    'teachermysql001',
    'CRM Grammar Drill',
    'Practice set ngu phap theo khoa hoc business grammar.',
    'practice-set',
    'intermediate',
    16,
    1,
    'published',
    JSON_ARRAY('Xem ky context email'),
    FALSE,
    JSON_ARRAY('coursemysqlseed007'),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed006');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed007',
    'teacher2mysql001',
    'Listening Trap Mastery',
    'Full test nho cho hoc vien dang hoc listening lab.',
    'full-test',
    'intermediate',
    25,
    1,
    'published',
    JSON_ARRAY('Nghe ky distractor'),
    TRUE,
    JSON_ARRAY('coursemysqlseed008'),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed007');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed008',
    'adminmysql001',
    'TOEIC Vocabulary Flash Check',
    'Mini test vocabulary free de hoc vien guest van co bo bai de loc va lam.',
    'mini-test',
    'beginner',
    10,
    1,
    'published',
    JSON_ARRAY('Tap trung vao word form va collocation'),
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed008');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed009',
    'adminmysql001',
    'IELTS Reading Speed Drill',
    'Practice set free cho hoc vien can tap reading speed.',
    'practice-set',
    'advanced',
    22,
    1,
    'published',
    JSON_ARRAY('Doc cau hoi truoc khi scan passage'),
    TRUE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed009');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed010',
    'adminmysql001',
    'Business Grammar Pressure Test',
    'Full test ngan cho business grammar va email wording.',
    'full-test',
    'intermediate',
    24,
    1,
    'published',
    JSON_ARRAY('Doc ky context office va CRM'),
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed010');

INSERT INTO mock_tests (
    id, created_by_id, title, description, type, level, duration_minutes, question_count, status,
    instructions, is_featured, assigned_course_ids, created_at, updated_at
)
SELECT
    'mockmysqlseed011',
    'adminmysql001',
    'Listening Short Response Sprint',
    'Mini free test cho short response va distractor handling.',
    'mini-test',
    'intermediate',
    11,
    1,
    'published',
    JSON_ARRAY('Nghe keyword cuoi cau hoi truoc'),
    FALSE,
    JSON_ARRAY(),
    UTC_TIMESTAMP(),
    UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_tests WHERE id = 'mockmysqlseed011');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed002','mockmysqlseed002','reading','Choose the best phrase for the sentence.','Use the future arrangement clue. ',NULL,NULL,1,1,'easy','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed002');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed002','A','will be attending',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed002' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed002','B','attend',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed002' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed003','mockmysqlseed003','writing','Choose the clearest thesis sentence.','Academic task response needs a direct position.',NULL,NULL,1,1,'medium','B',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed003');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed003','A','There are many opinions about this issue.',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed003' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed003','B','I believe public transport investment should come before road expansion.',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed003' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed004','mockmysqlseed004','reading','Select the best transition for the memo.','A contrast signal is needed here.',NULL,NULL,1,1,'easy','B',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed004');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed004','A','Therefore',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed004' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed004','B','However',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed004' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed005','mockmysqlseed005','speaking','Which opener sounds most natural for a follow-up answer?','A short direct answer then expansion is best.',NULL,NULL,1,1,'medium','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed005');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed005','A','One reason is that it keeps the response focused before I add detail.',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed005' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed005','B','Maybe because speaking is difficult for many candidates perhaps.',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed005' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed006','mockmysqlseed006','mixed','Choose the correct verb form for the client update email.','The sentence needs present perfect for a completed action with current relevance.',NULL,NULL,1,1,'medium','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed006');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed006','A','has confirmed',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed006' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed006','B','confirm',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed006' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed007','mockmysqlseed007','listening','Choose the response that best matches the short question.','The speaker asks for confirmation, so a short confirming response fits.',NULL,NULL,1,1,'medium','B',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed007');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed007','A','At the front desk yesterday.',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed007' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed007','B','Yes, I sent the revised file this morning.',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed007' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed008','mockmysqlseed008','mixed','Choose the noun form that best completes the sentence.','A noun is required after the determiner.',NULL,NULL,1,1,'easy','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed008');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed008','A','improvement',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed008' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed008','B','improve',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed008' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed009','mockmysqlseed009','reading','Which heading best matches the paragraph focus?','The paragraph focuses on time management for reading.',NULL,NULL,1,1,'advanced','B',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed009');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed009','A','Recruitment budget concerns',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed009' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed009','B','How to keep reading pace under time pressure',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed009' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed010','mockmysqlseed010','mixed','Choose the best connector for the update email.','A result connector fits the sentence best.',NULL,NULL,1,1,'medium','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed010');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed010','A','Therefore',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed010' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed010','B','Although',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed010' AND option_key='B');

INSERT INTO mock_test_questions (id, mock_test_id, section_name, prompt, explanation, audio_url, image_url, points, question_order, difficulty_level, correct_answer, created_at, updated_at)
SELECT 'mockquestionseed011','mockmysqlseed011','listening','Choose the best reply to the short question.','A direct confirmation is the natural response.',NULL,NULL,1,1,'medium','A',UTC_TIMESTAMP(),UTC_TIMESTAMP()
WHERE NOT EXISTS (SELECT 1 FROM mock_test_questions WHERE id='mockquestionseed011');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed011','A','Yes, the package arrived this morning.',TRUE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed011' AND option_key='A');
INSERT INTO mock_test_question_options (question_id, option_key, option_text, is_correct)
SELECT 'mockquestionseed011','B','Near the elevators on the second floor.',FALSE WHERE NOT EXISTS (SELECT 1 FROM mock_test_question_options WHERE question_id='mockquestionseed011' AND option_key='B');
