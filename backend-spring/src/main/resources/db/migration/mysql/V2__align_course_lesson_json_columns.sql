-- Align early MySQL baseline column names with the JPA entity mapping used by
-- the Spring hybrid stores. Each rename is guarded so the migration succeeds
-- both on old databases and on fresh databases created from the corrected V1.

SET @rename_courses_materials = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'courses'
              AND column_name = 'materials'
        ),
        'ALTER TABLE courses RENAME COLUMN materials TO materials_json',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_courses_materials;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @rename_courses_tags = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'courses'
              AND column_name = 'tags'
        ),
        'ALTER TABLE courses RENAME COLUMN tags TO tags_json',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_courses_tags;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @rename_courses_benefits = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'courses'
              AND column_name = 'benefits'
        ),
        'ALTER TABLE courses RENAME COLUMN benefits TO benefits_json',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_courses_benefits;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @rename_lessons_video = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'lessons'
              AND column_name = 'video'
        ),
        'ALTER TABLE lessons RENAME COLUMN video TO video_json',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_lessons_video;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @rename_lessons_materials = (
    SELECT IF(
        EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = DATABASE()
              AND table_name = 'lessons'
              AND column_name = 'materials'
        ),
        'ALTER TABLE lessons RENAME COLUMN materials TO materials_json',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_lessons_materials;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
