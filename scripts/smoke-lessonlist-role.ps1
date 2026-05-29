$ErrorActionPreference = 'Stop'

function Headers([string]$token) {
  $headers = @{ 'Content-Type' = 'application/json' }
  if ($token) {
    $headers['Authorization'] = "Bearer $token"
  }
  return $headers
}

$base = 'http://localhost:5000/api'

$adminToken = (
  Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Headers (Headers '') -Body (
    @{ email = 'admin@ivyts.dev'; password = 'Password@123' } | ConvertTo-Json
  )
).data.accessToken

$teacherToken = (
  Invoke-RestMethod -Method Post -Uri "$base/auth/login" -Headers (Headers '') -Body (
    @{ email = 'teacher@ivyts.dev'; password = 'Password@123' } | ConvertTo-Json
  )
).data.accessToken

$teacherCourses = (Invoke-RestMethod -Method Get -Uri "$base/courses/manage/mine" -Headers (Headers $teacherToken)).data
$teacherCourse = $teacherCourses | Select-Object -First 1

$teacherLessonPayload = @{
  title = 'LessonList Smoke'
  description = 'Lesson smoke for permission check'
  order = 999
  isPreview = $true
  video = @{
    videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    videoProvider = 'youtube'
    duration = 120
    thumbnail = 'https://example.com/thumb.jpg'
  }
  materials = @()
} | ConvertTo-Json -Depth 10

$createdLesson = (
  Invoke-RestMethod -Method Post -Uri "$base/courses/$($teacherCourse.id)/lessons" -Headers (Headers $teacherToken) -Body $teacherLessonPayload
).data

$updatedLesson = (
  Invoke-RestMethod -Method Patch -Uri "$base/lessons/$($createdLesson.id)" -Headers (Headers $teacherToken) -Body (
    @{ title = 'LessonList Smoke Updated' } | ConvertTo-Json
  )
).data

Invoke-RestMethod -Method Delete -Uri "$base/lessons/$($createdLesson.id)" -Headers (Headers $teacherToken) | Out-Null

$publicCourses = (Invoke-RestMethod -Method Get -Uri "$base/courses" -Headers (Headers '')).data
$foreignCourse = $publicCourses | Where-Object { $_.owner.id -ne $teacherCourse.owner.id } | Select-Object -First 1

$forbiddenStatus = ''
try {
  Invoke-RestMethod -Method Post -Uri "$base/courses/$($foreignCourse.id)/lessons" -Headers (Headers $teacherToken) -Body $teacherLessonPayload | Out-Null
} catch {
  $forbiddenStatus = $_.Exception.Response.StatusCode.value__
}

$adminLessonPayload = @{
  title = 'Admin LessonList Smoke'
  description = 'Admin lesson smoke'
  order = 998
  isPreview = $false
  video = @{
    videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    videoProvider = 'youtube'
    duration = 90
    thumbnail = 'https://example.com/admin-thumb.jpg'
  }
  materials = @()
} | ConvertTo-Json -Depth 10

$adminCreated = (
  Invoke-RestMethod -Method Post -Uri "$base/courses/$($foreignCourse.id)/lessons" -Headers (Headers $adminToken) -Body $adminLessonPayload
).data

Invoke-RestMethod -Method Delete -Uri "$base/lessons/$($adminCreated.id)" -Headers (Headers $adminToken) | Out-Null

[pscustomobject]@{
  teacherOwnCourseTitle = $teacherCourse.title
  teacherCreateOk = ($createdLesson.title -eq 'LessonList Smoke')
  teacherUpdateOk = ($updatedLesson.title -eq 'LessonList Smoke Updated')
  teacherDeleteOk = $true
  teacherForeignCreateStatus = $forbiddenStatus
  adminCrossCourseCreateOk = ($adminCreated.title -eq 'Admin LessonList Smoke')
} | ConvertTo-Json -Depth 5
