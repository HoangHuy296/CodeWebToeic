$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
$stackReadyScript = Join-Path $PSScriptRoot "assert-spring-stack-ready.ps1"
$baseUrl = & $stackReadyScript -PassThruUrl

function Invoke-ApiJson {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [object]$Body,
    [hashtable]$Headers
  )

  $params = @{
    Method      = $Method
    Uri         = $Url
    TimeoutSec  = 20
    ErrorAction = "Stop"
  }

  if ($Headers) {
    $params.Headers = $Headers
  }

  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  Invoke-RestMethod @params
}

function Invoke-ApiExpectStatus {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][int]$ExpectedStatus,
    [object]$Body,
    [hashtable]$Headers
  )

  try {
    $null = Invoke-ApiJson -Method $Method -Url $Url -Body $Body -Headers $Headers
    if ($ExpectedStatus -ne 200 -and $ExpectedStatus -ne 201) {
      throw "Expected HTTP $ExpectedStatus but request succeeded."
    }
    return $true
  } catch {
    $response = $_.Exception.Response
    if ($null -eq $response) {
      throw
    }

    $statusCode = [int]$response.StatusCode
    if ($statusCode -ne $ExpectedStatus) {
      throw "Expected HTTP $ExpectedStatus but received $statusCode"
    }

    return $true
  }
}

$cleanupState = [ordered]@{
  RegressionKey   = [guid]::NewGuid().ToString("N").Substring(0, 10)
  CourseId        = $null
  DraftCourseId   = $null
  LessonId        = $null
  MessageSubject  = $null
}

$cleanupRunner = Join-Path $PSScriptRoot "invoke-cleanup-regression.ps1"

$teacherAssignedCourseId = "coursemysqlseed001"
$lessonOrder = Get-Random -Minimum 200 -Maximum 999

Write-Host "Running Spring + MySQL regression smoke test..." -ForegroundColor Cyan
try {
  & $cleanupRunner -Context "Pre-regression"
} catch {}
try {
  Write-Host "- health" -ForegroundColor DarkCyan
  $health = Invoke-ApiJson -Method Get -Url "$baseUrl/health"

  Write-Host "- auth" -ForegroundColor DarkCyan
  $adminLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "admin@ivyts.dev"
    password = "Password@123"
  }
  $teacherLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "teacher@ivyts.dev"
    password = "Password@123"
  }
  $studentLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "student3@ivyts.dev"
    password = "Password@123"
  }

  $adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }
  $teacherHeaders = @{ Authorization = "Bearer $($teacherLogin.data.accessToken)" }
  $studentHeaders = @{ Authorization = "Bearer $($studentLogin.data.accessToken)" }

  $stats = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/stats" -Headers $adminHeaders
  $courses = Invoke-ApiJson -Method Get -Url "$baseUrl/courses" -Headers $studentHeaders
  $mockTests = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests" -Headers $studentHeaders
  $messages = Invoke-ApiJson -Method Get -Url "$baseUrl/messages" -Headers $adminHeaders
  $notifications = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $adminHeaders
  $meAdmin = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $adminHeaders
  $meTeacher = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $teacherHeaders
  $meStudent = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $studentHeaders

  Write-Host "- teacher create reviewed course" -ForegroundColor DarkCyan
  $courseSlug = "regression-course-$($cleanupState.RegressionKey)"
  $createdCourse = Invoke-ApiJson -Method Post -Url "$baseUrl/courses" -Headers $teacherHeaders -Body @{
    title            = "Regression Course $courseSlug"
    shortDescription = "Course created during Spring + MySQL regression $($cleanupState.RegressionKey)."
    description      = "Longer description for role and review workflow regression testing $($cleanupState.RegressionKey)."
    category         = "TOEIC"
    level            = "beginner"
    price            = 1250000
    salePrice        = 990000
    thumbnail        = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
    introVideo       = @{
      videoUrl      = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      videoProvider = "youtube"
      duration      = 480
      thumbnail     = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
    }
    materials        = @()
    tags             = @("toeic", "regression", $cleanupState.RegressionKey)
    benefits         = @("Role workflow")
  }
  $cleanupState.CourseId = $createdCourse.data.id

  Write-Host "- teacher create draft publish probe" -ForegroundColor DarkCyan
  $draftPublishProbe = Invoke-ApiJson -Method Post -Url "$baseUrl/courses" -Headers $teacherHeaders -Body @{
    title            = "Teacher Publish Probe $($cleanupState.RegressionKey)"
    shortDescription = "Draft probe course for publish permission regression $($cleanupState.RegressionKey)."
    description      = "This course stays in draft so the regression can verify teacher publish permission is denied $($cleanupState.RegressionKey)."
    category         = "TOEIC"
    level            = "beginner"
    price            = 980000
    salePrice        = 790000
    thumbnail        = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
    introVideo       = @{
      videoUrl      = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      videoProvider = "youtube"
      duration      = 420
      thumbnail     = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
    }
    materials        = @()
    tags             = @("toeic", "probe", $cleanupState.RegressionKey)
    benefits         = @("Permission probe")
  }
  $cleanupState.DraftCourseId = $draftPublishProbe.data.id

  Write-Host "- admin review cycle" -ForegroundColor DarkCyan
  $adminNotificationsBeforeReview = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $adminHeaders

  $updatedCourse = Invoke-ApiJson -Method Patch -Url ("{0}/courses/{1}" -f $baseUrl, $createdCourse.data.id) -Headers $adminHeaders -Body @{
    reviewStatus = "changes_requested"
    reviewNote   = "Need more details in the course summary $($cleanupState.RegressionKey)"
    isPublished  = $false
  }

  $teacherNotificationsAfterReview = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $teacherHeaders

  $publishedCourse = Invoke-ApiJson -Method Patch -Url ("{0}/courses/{1}" -f $baseUrl, $createdCourse.data.id) -Headers $adminHeaders -Body @{
    reviewStatus = "approved"
    isPublished  = $true
  }

  $teacherNotificationsAfterPublish = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $teacherHeaders

  Write-Host "- teacher create lesson on assigned seed course" -ForegroundColor DarkCyan
  $lesson = Invoke-ApiJson -Method Post -Url ("{0}/courses/{1}/lessons" -f $baseUrl, $teacherAssignedCourseId) -Headers $teacherHeaders -Body @{
    title       = "Regression Lesson $($cleanupState.RegressionKey)"
    slug        = "regression-lesson-$($cleanupState.RegressionKey)"
    description = "Lesson created during regression $($cleanupState.RegressionKey)."
    content     = "Lesson body"
    order       = $lessonOrder
    isPreview   = $true
    video       = @{
      videoUrl      = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      videoProvider = "youtube"
      duration      = 720
      thumbnail     = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
    }
    materials   = @()
  }
  $cleanupState.LessonId = $lesson.data.id

  Write-Host "- student enroll assigned seed course" -ForegroundColor DarkCyan
  try {
    $enrollment = Invoke-ApiJson -Method Post -Url "$baseUrl/enrollments" -Headers $studentHeaders -Body @{
      courseId = $teacherAssignedCourseId
    }
  } catch {
    $response = $_.Exception.Response
    if ($null -eq $response -or [int]$response.StatusCode -ne 409) {
      throw
    }

    $existingEnrollments = Invoke-ApiJson -Method Get -Url "$baseUrl/enrollments/me" -Headers $studentHeaders
    $existingEnrollment = @($existingEnrollments.data | Where-Object { $_.course.id -eq $teacherAssignedCourseId }) | Select-Object -First 1
    if (-not $existingEnrollment) {
      throw
    }

    $enrollment = @{
      data = $existingEnrollment
    }
  }

  $studentNotificationsAfterEnroll = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $studentHeaders
  $teacherNotificationsAfterEnroll = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $teacherHeaders
  $adminNotificationsAfterEnroll = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $adminHeaders

  Write-Host "- student update progress and fetch learning" -ForegroundColor DarkCyan
  $progress = Invoke-ApiJson -Method Patch -Url ("{0}/enrollments/{1}/progress" -f $baseUrl, $teacherAssignedCourseId) -Headers $studentHeaders -Body @{
    lessonId       = $lesson.data.id
    watchedSeconds = 720
    isCompleted    = $true
  }

  $learning = Invoke-ApiJson -Method Get -Url ("{0}/learning/{1}" -f $baseUrl, $teacherAssignedCourseId) -Headers $studentHeaders

  $cleanupState.MessageSubject = "Regression internal message $($cleanupState.RegressionKey)"
  Write-Host "- admin send internal message" -ForegroundColor DarkCyan
  $internalMessage = Invoke-ApiJson -Method Post -Url "$baseUrl/messages/internal" -Headers $adminHeaders -Body @{
    recipientUserId = "teachermysql001"
    subject         = $cleanupState.MessageSubject
    content         = "This message verifies role-based internal messaging $($cleanupState.RegressionKey)."
  }

  $teacherNotificationsAfterMessage = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $teacherHeaders

  $teacherRecipients = Invoke-ApiJson -Method Get -Url "$baseUrl/messages/recipients" -Headers $teacherHeaders
  $studentRecipients = Invoke-ApiJson -Method Get -Url "$baseUrl/messages/recipients" -Headers $studentHeaders
  $adminUsers = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/users" -Headers $adminHeaders

  Write-Host "- forbidden checks" -ForegroundColor DarkCyan
  $studentForbiddenAdminStats = Invoke-ApiExpectStatus -Method Get -Url "$baseUrl/admin/stats" -ExpectedStatus 403 -Headers $studentHeaders
  $teacherForbiddenCreatePost = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/posts" -ExpectedStatus 403 -Headers $teacherHeaders -Body @{
    title          = "Teacher cannot create post"
    excerpt        = "Teacher post creation should be blocked by admin-only permission."
    content        = "This regression payload is intentionally valid so the response proves authorization, not validation."
    status         = "draft"
    tags           = @("permission", "regression")
    seoDescription = "Teacher permission regression"
  }
  $studentForbiddenCreateMockTest = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/mock-tests" -ExpectedStatus 403 -Headers $studentHeaders -Body @{
    title            = "Forbidden mock test"
    description      = "This regression payload is valid and should fail on authorization only."
    type             = "mini-test"
    level            = "beginner"
    durationMinutes  = 15
    status           = "draft"
    instructions     = @("Instruction")
    assignedCourseIds = @()
    questions        = @(
      @{
        section       = "reading"
        prompt        = "Choose the correct answer."
        explanation   = "Regression question"
        options       = @(
          @{ key = "A"; text = "Option A"; isCorrect = $true },
          @{ key = "B"; text = "Option B"; isCorrect = $false },
          @{ key = "C"; text = "Option C"; isCorrect = $false },
          @{ key = "D"; text = "Option D"; isCorrect = $false }
        )
        correctAnswer = "A"
        points        = 1
        order         = 1
        level         = "easy"
      }
    )
  }
  $studentForbiddenStudentMessage = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/messages/internal" -ExpectedStatus 403 -Headers $studentHeaders -Body @{
    recipientUserId = "student2mysql001"
    subject         = "Forbidden message"
    content         = "Student cannot message another student."
  }
  $teacherForbiddenDirectPublish = Invoke-ApiExpectStatus -Method Patch -Url ("{0}/courses/{1}" -f $baseUrl, $draftPublishProbe.data.id) -ExpectedStatus 403 -Headers $teacherHeaders -Body @{
    isPublished = $true
  }

  $summary = [ordered]@{
    healthService                    = $health.data.service
    adminRole                        = $adminLogin.data.user.role
    teacherRole                      = $teacherLogin.data.user.role
    studentRole                      = $studentLogin.data.user.role
    meAdminRole                      = $meAdmin.data.role
    meTeacherRole                    = $meTeacher.data.role
    meStudentRole                    = $meStudent.data.role
    publishedCourses                 = $stats.data.content.publishedCourses
    paidOrders                       = $stats.data.revenue.paidOrders
    publicCourseCount                = @($courses.data).Count
    publicMockTestCount              = @($mockTests.data).Count
    adminMessageCount                = @($messages.data).Count
    adminUnreadNotiCount             = $notifications.data.unreadCount
    teacherCourseReviewStatus        = $createdCourse.data.reviewStatus
    adminChangedReviewStatus         = $updatedCourse.data.reviewStatus
    adminPublishedState              = $publishedCourse.data.isPublished
    lessonCreated                    = $lesson.data.title
    enrollmentStatus                 = $enrollment.data.status
    progressPercent                  = $progress.data.progressPercent
    learningProgressPercent          = $learning.data.enrollment.progressPercent
    learningLessonCount              = @($learning.data.lessons).Count
    teacherRecipientsCount           = @($teacherRecipients.data).Count
    studentRecipientsCount           = @($studentRecipients.data).Count
    adminUsersCount                  = @($adminUsers.data).Count
    adminLatestNotificationTitle     = if ($adminNotificationsAfterEnroll.data.items.Count -gt 0) { $adminNotificationsAfterEnroll.data.items[0].title } else { $null }
    teacherLatestNotificationTitle   = if ($teacherNotificationsAfterMessage.data.items.Count -gt 0) { $teacherNotificationsAfterMessage.data.items[0].title } else { $null }
    studentLatestNotificationTitle   = if ($studentNotificationsAfterEnroll.data.items.Count -gt 0) { $studentNotificationsAfterEnroll.data.items[0].title } else { $null }
    studentForbiddenAdminStats       = $studentForbiddenAdminStats
    teacherForbiddenCreatePost       = $teacherForbiddenCreatePost
    studentForbiddenCreateMockTest   = $studentForbiddenCreateMockTest
    studentForbiddenStudentMessage   = $studentForbiddenStudentMessage
    teacherForbiddenDirectPublish    = $teacherForbiddenDirectPublish
  }

  $summary | ConvertTo-Json -Depth 10
}
finally {
  try {
    & $cleanupRunner -Context "Post-regression"
  } catch {}
}
