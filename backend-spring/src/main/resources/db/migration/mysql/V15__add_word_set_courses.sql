-- Word sets now belong to a course (TOEIC Starter, TOEIC Booster, TOEIC Winner...). The
-- picker groups chapters under their course, so "Starter 1..13" become "Chapter 1..13" of the
-- TOEIC Starter course. Slugs and item ids are unchanged, so learners' saved progress and old
-- score rows keep working.

ALTER TABLE word_items
    ADD COLUMN course_slug  VARCHAR(64)  NOT NULL DEFAULT '',
    ADD COLUMN course_name  VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN course_order INT          NOT NULL DEFAULT 0,
    ADD COLUMN set_order    INT          NOT NULL DEFAULT 0;

-- course_order: 1 = Starter, 2 = Booster, 3 = Winner (Booster/Winner chapters are added later).
UPDATE word_items
SET course_slug  = 'toeic-starter',
    course_name  = 'TOEIC Starter',
    course_order = 1,
    set_order    = CAST(SUBSTRING(set_slug, 9) AS UNSIGNED),
    set_name     = CONCAT('Chapter ', SUBSTRING(set_slug, 9))
WHERE set_slug LIKE 'starter-%';

-- Score rows store a "<course> · <chapter>" label so results stay unambiguous across courses.
UPDATE word_scores
SET set_name = CONCAT('TOEIC Starter · Chapter ', SUBSTRING(set_slug, 9))
WHERE set_slug LIKE 'starter-%';

CREATE INDEX idx_word_items_course ON word_items (course_order, set_order);
