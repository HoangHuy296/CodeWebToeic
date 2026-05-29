$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

function Test-DockerExecAccess {
  $null = & docker exec codewebtoeic-mysql-1 mysql --version 2>$null
  return ($LASTEXITCODE -eq 0)
}

if (-not (Test-DockerExecAccess)) {
  Write-Warning "Skipping regression cleanup because Docker CLI cannot access container codewebtoeic-mysql-1 in this shell."
  return
}

$sql = @"
DELETE FROM notifications
WHERE message LIKE '%Regression %'
   OR message LIKE '%Teacher Publish Probe %'
   OR message LIKE '%Teacher smoke %'
   OR message LIKE '%Admin smoke %'
   OR message LIKE '%Regression internal message %'
   OR message LIKE '%Teacher smoke message %'
   OR message LIKE '%Admin smoke message %'
   OR metadata_json LIKE '%regression-course-%'
   OR metadata_json LIKE '%teacher-smoke-course-%'
   OR metadata_json LIKE '%admin-smoke-post-%'
   OR metadata_json LIKE '%Regression internal message %';
DELETE FROM messages
WHERE subject LIKE 'Regression internal message %'
   OR subject LIKE 'Teacher smoke message %'
   OR subject LIKE 'Admin smoke message %';
DELETE FROM test_submission_answers
WHERE submission_id IN (
  SELECT id FROM test_submissions
  WHERE mock_test_id IN (
    SELECT id FROM mock_tests
    WHERE title LIKE 'Teacher Smoke Mock %'
  )
);
DELETE FROM test_submissions
WHERE mock_test_id IN (
  SELECT id FROM mock_tests
  WHERE title LIKE 'Teacher Smoke Mock %'
);
DELETE FROM mock_test_question_options
WHERE question_id IN (
  SELECT id FROM mock_test_questions
  WHERE mock_test_id IN (
    SELECT id FROM mock_tests
    WHERE title LIKE 'Teacher Smoke Mock %'
  )
);
DELETE FROM mock_test_questions
WHERE mock_test_id IN (
  SELECT id FROM mock_tests
  WHERE title LIKE 'Teacher Smoke Mock %'
);
DELETE FROM mock_tests
WHERE title LIKE 'Teacher Smoke Mock %';
DELETE FROM blog_posts
WHERE slug LIKE 'admin-smoke-post-%'
   OR title LIKE 'Admin Smoke Post %';
DELETE FROM enrollment_lesson_progress
WHERE enrollment_id IN (
  SELECT id FROM enrollments
  WHERE course_id IN (
    SELECT id FROM courses
    WHERE slug LIKE 'regression-course-%'
       OR slug LIKE 'teacher-smoke-course-%'
       OR title LIKE 'Teacher Publish Probe %'
       OR title LIKE 'Teacher Smoke Course %'
  )
);
DELETE FROM enrollments
WHERE course_id IN (
  SELECT id FROM courses
  WHERE slug LIKE 'regression-course-%'
     OR slug LIKE 'teacher-smoke-course-%'
     OR title LIKE 'Teacher Publish Probe %'
     OR title LIKE 'Teacher Smoke Course %'
);
DELETE FROM lessons
WHERE course_id IN (
  SELECT id FROM courses
  WHERE slug LIKE 'regression-course-%'
     OR slug LIKE 'teacher-smoke-course-%'
     OR title LIKE 'Teacher Publish Probe %'
     OR title LIKE 'Teacher Smoke Course %'
);
DELETE FROM courses
WHERE slug LIKE 'regression-course-%'
   OR slug LIKE 'teacher-smoke-course-%'
   OR title LIKE 'Teacher Publish Probe %'
   OR title LIKE 'Teacher Smoke Course %';
"@

& docker exec codewebtoeic-mysql-1 mysql -uivyts -pivyts ivyts_1997 -e $sql 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Regression cleanup SQL failed on codewebtoeic-mysql-1."
}

Write-Host "Regression cleanup completed on codewebtoeic-mysql-1." -ForegroundColor Green
