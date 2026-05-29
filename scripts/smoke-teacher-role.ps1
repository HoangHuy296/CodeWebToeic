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
    $params.Body = ($Body | ConvertTo-Json -Depth 20)
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

$cleanupRunner = Join-Path $PSScriptRoot "invoke-cleanup-regression.ps1"
$teacherKey = [guid]::NewGuid().ToString("N").Substring(0, 10)
$teacherAssignedCourseId = "coursemysqlseed001"

Write-Host "Running teacher-role smoke test on Spring + MySQL..." -ForegroundColor Cyan
try {
  & $cleanupRunner -Context "Pre-teacher-smoke"
} catch {}

try {
  $teacherLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "teacher@ivyts.dev"
    password = "Password@123"
  }

  $teacherHeaders = @{ Authorization = "Bearer $($teacherLogin.data.accessToken)" }
  $me = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $teacherHeaders
  $exerciseTopics = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/topics" -Headers $teacherHeaders
  if (@($exerciseTopics.data).Count -eq 0) {
    throw "No exercise topics available for teacher smoke test."
  }
  $teacherExerciseTopicSlug = $exerciseTopics.data[0].slug

  $courseSlug = "teacher-smoke-course-$teacherKey"
  $createdCourse = Invoke-ApiJson -Method Post -Url "$baseUrl/courses" -Headers $teacherHeaders -Body @{
    title            = "Teacher Smoke Course $teacherKey"
    shortDescription = "Teacher smoke course $teacherKey"
    description      = "Teacher smoke course description $teacherKey"
    category         = "TOEIC"
    level            = "intermediate"
    price            = 1350000
    salePrice        = 1090000
    thumbnail        = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80"
    introVideo       = @{
      videoUrl      = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      videoProvider = "youtube"
      duration      = 540
      thumbnail     = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
    }
    materials        = @()
    tags             = @("teacher", "smoke", $teacherKey)
    benefits         = @("Teacher workflow")
  }

  $lesson = Invoke-ApiJson -Method Post -Url ("{0}/courses/{1}/lessons" -f $baseUrl, $createdCourse.data.id) -Headers $teacherHeaders -Body @{
    title       = "Teacher Smoke Lesson $teacherKey"
    slug        = "teacher-smoke-lesson-$teacherKey"
    description = "Teacher smoke lesson $teacherKey"
    content     = "Lesson body"
    order       = 1
    isPreview   = $true
    video       = @{
      videoUrl      = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      videoProvider = "youtube"
      duration      = 600
      thumbnail     = "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"
    }
    materials   = @()
  }

$manageCourses = Invoke-ApiJson -Method Get -Url "$baseUrl/courses/manage/mine" -Headers $teacherHeaders

$createdExercise = Invoke-ApiJson -Method Post -Url "$baseUrl/exercises/items" -Headers $teacherHeaders -Body @{
  title             = "Teacher Smoke Exercise $teacherKey"
  description       = "Teacher smoke exercise $teacherKey"
  type              = "practice-set"
  level             = "intermediate"
  durationMinutes   = 12
  status            = "draft"
  instructions      = @("Teacher smoke exercise")
  assignedCourseIds = @($teacherAssignedCourseId)
  catalogKind       = "exercise"
  exerciseTopicSlug = $teacherExerciseTopicSlug
  questions         = @(
    @{
      section       = "reading"
      prompt        = "Teacher exercise prompt."
      explanation   = "Teacher exercise explanation"
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

$createdMock = Invoke-ApiJson -Method Post -Url "$baseUrl/mock-tests" -Headers $teacherHeaders -Body @{
  title             = "Teacher Smoke Mock $teacherKey"
    description       = "Teacher smoke mock $teacherKey"
    type              = "mini-test"
    level             = "intermediate"
    durationMinutes   = 18
    status            = "draft"
    instructions      = @("Teacher smoke")
    assignedCourseIds = @($teacherAssignedCourseId)
    questions         = @(
      @{
        section       = "reading"
        prompt        = "Choose the correct answer."
        explanation   = "Teacher smoke question"
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

$manageMocks = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests/manage/mine" -Headers $teacherHeaders
$manageExercises = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items/manage/mine" -Headers $teacherHeaders
$recipients = Invoke-ApiJson -Method Get -Url "$baseUrl/messages/recipients" -Headers $teacherHeaders
$message = Invoke-ApiJson -Method Post -Url "$baseUrl/messages/internal" -Headers $teacherHeaders -Body @{
    recipientUserId = "adminmysql001"
    subject         = "Teacher smoke message $teacherKey"
    content         = "Teacher smoke message body $teacherKey"
  }
  $notifications = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $teacherHeaders

  $teacherForbiddenAdminStats = Invoke-ApiExpectStatus -Method Get -Url "$baseUrl/admin/stats" -ExpectedStatus 403 -Headers $teacherHeaders
  $teacherForbiddenCreatePost = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/posts" -ExpectedStatus 403 -Headers $teacherHeaders -Body @{
    title          = "Teacher forbidden post"
    excerpt        = "Teacher cannot create posts."
    content        = "Teacher cannot create posts."
    status         = "draft"
    tags           = @("teacher", "forbidden")
    seoDescription = "forbidden"
  }
  $teacherForbiddenDirectPublish = Invoke-ApiExpectStatus -Method Patch -Url ("{0}/courses/{1}" -f $baseUrl, $createdCourse.data.id) -ExpectedStatus 403 -Headers $teacherHeaders -Body @{
    isPublished = $true
  }

  $summary = [ordered]@{
    loginRole                      = $teacherLogin.data.user.role
    meRole                         = $me.data.role
    createdCourseReviewStatus      = $createdCourse.data.reviewStatus
    createdCoursePublished         = $createdCourse.data.isPublished
    lessonCreated                  = $lesson.data.title
    exerciseTopicsCount            = @($exerciseTopics.data).Count
    manageCoursesContainsOwn       = (@($manageCourses.data | Where-Object { $_.id -eq $createdCourse.data.id }).Count -gt 0)
    createdExerciseCatalogKind     = $createdExercise.data.catalogKind
    createdExerciseTopicSlug       = $createdExercise.data.exerciseTopicSlug
    manageExercisesContainsOwn     = (@($manageExercises.data | Where-Object { $_.id -eq $createdExercise.data.id }).Count -gt 0)
    createdMockStatus              = $createdMock.data.status
    createdMockAssignedCourses     = @($createdMock.data.assignedCourseIds).Count
    manageMocksContainsOwn         = (@($manageMocks.data | Where-Object { $_.id -eq $createdMock.data.id }).Count -gt 0)
    messageRecipientsCount         = @($recipients.data).Count
    internalMessageStatus          = $message.data.status
    unreadNotificationCount        = $notifications.data.unreadCount
    forbiddenAdminStats            = $teacherForbiddenAdminStats
    forbiddenCreatePost            = $teacherForbiddenCreatePost
    forbiddenDirectPublish         = $teacherForbiddenDirectPublish
  }

  $summary | ConvertTo-Json -Depth 10
}
finally {
  try {
    & $cleanupRunner -Context "Post-teacher-smoke"
  } catch {}
}
