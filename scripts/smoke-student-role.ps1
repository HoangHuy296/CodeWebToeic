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

Write-Host "Running student-role smoke test on Spring + MySQL..." -ForegroundColor Cyan
try {
  & $cleanupRunner -Context "Pre-student-smoke"
} catch {}

$studentLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
  email    = "student1@ivyts.dev"
  password = "Password@123"
}

$studentHeaders = @{ Authorization = "Bearer $($studentLogin.data.accessToken)" }
$me = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $studentHeaders
$courses = Invoke-ApiJson -Method Get -Url "$baseUrl/courses" -Headers $studentHeaders
$enrollments = Invoke-ApiJson -Method Get -Url "$baseUrl/enrollments/me" -Headers $studentHeaders
$mockTests = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests" -Headers $studentHeaders
$exerciseItems = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items" -Headers $studentHeaders
$messagesRecipients = Invoke-ApiJson -Method Get -Url "$baseUrl/messages/recipients" -Headers $studentHeaders
$notifications = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $studentHeaders

$learningCourseId = $null
foreach ($enrollment in @($enrollments.data)) {
  $candidateLearning = Invoke-ApiJson -Method Get -Url "$baseUrl/learning/$($enrollment.course.id)" -Headers $studentHeaders
  if (@($candidateLearning.data.lessons).Count -gt 0) {
    $learningCourseId = $enrollment.course.id
    break
  }
}

if (-not $learningCourseId -and @($courses.data).Count -gt 0) {
  foreach ($course in @($courses.data)) {
    $courseLearning = Invoke-ApiJson -Method Get -Url "$baseUrl/learning/$($course.id)" -Headers $studentHeaders
    if (@($courseLearning.data.lessons).Count -gt 0) {
      $learningCourseId = $course.id
      break
    }
  }
}

if (-not $learningCourseId -and @($courses.data).Count -gt 0) {
  $enrollResult = Invoke-ApiJson -Method Post -Url "$baseUrl/enrollments" -Headers $studentHeaders -Body @{
    courseId = $courses.data[0].id
  }
  $learningCourseId = $enrollResult.data.course.id
}

if (-not $learningCourseId) {
  throw "No course with learning content available for student smoke test."
}

$learning = Invoke-ApiJson -Method Get -Url "$baseUrl/learning/$learningCourseId" -Headers $studentHeaders

$mockTestDetailHasCorrectAnswer = $false
$mockTestSubmitScore = $null
$mockTestSubmitSucceeded = $false
$mockTestSubmitError = $null
$exerciseDetailHasCorrectAnswer = $false
$exerciseSubmitScore = $null
$exerciseSubmitSucceeded = $false
$exerciseSubmitError = $null
if (@($mockTests.data).Count -gt 0) {
  $mockTestDetail = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests/$($mockTests.data[0].id)" -Headers $studentHeaders
  $mockTestDetailHasCorrectAnswer = ($mockTestDetail.data.questions | ConvertTo-Json -Depth 10) -match "correctAnswer"

  if (@($mockTestDetail.data.questions).Count -gt 0) {
    $answers = @()
    foreach ($question in $mockTestDetail.data.questions) {
      $firstOption = $question.options[0]
      $answers += @{
        questionId      = $question.id
        selectedOption  = $firstOption.key
        answerText      = $firstOption.text
      }
    }

    try {
      $submission = Invoke-ApiJson -Method Post -Url "$baseUrl/mock-tests/$($mockTests.data[0].id)/submit" -Headers $studentHeaders -Body @{
        answers = $answers
      }
      $mockTestSubmitScore = $submission.data.score
      $mockTestSubmitSucceeded = $true
    } catch {
      $mockTestSubmitError = $_.Exception.Message
    }
  }
}

if (@($exerciseItems.data).Count -gt 0) {
  $exerciseDetail = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items/$($exerciseItems.data[0].id)" -Headers $studentHeaders
  $exerciseDetailHasCorrectAnswer = ($exerciseDetail.data.questions | ConvertTo-Json -Depth 10) -match "correctAnswer"

  if (@($exerciseDetail.data.questions).Count -gt 0) {
    $exerciseAnswers = @()
    foreach ($question in $exerciseDetail.data.questions) {
      $firstOption = $question.options[0]
      $exerciseAnswers += @{
        questionId      = $question.id
        selectedOption  = $firstOption.key
        answerText      = $firstOption.text
      }
    }

    try {
      $exerciseSubmission = Invoke-ApiJson -Method Post -Url "$baseUrl/exercises/items/$($exerciseItems.data[0].id)/submit" -Headers $studentHeaders -Body @{
        answers = $exerciseAnswers
      }
      $exerciseSubmitScore = $exerciseSubmission.data.score
      $exerciseSubmitSucceeded = $true
    } catch {
      $exerciseSubmitError = $_.Exception.Message
    }
  }
}

$studentForbiddenAdminStats = Invoke-ApiExpectStatus -Method Get -Url "$baseUrl/admin/stats" -ExpectedStatus 403 -Headers $studentHeaders
$studentForbiddenCreatePost = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/posts" -ExpectedStatus 403 -Headers $studentHeaders -Body @{
  title          = "Forbidden student post"
  excerpt        = "Student cannot create posts."
  content        = "Student cannot create posts."
  status         = "draft"
  tags           = @("student", "forbidden")
  seoDescription = "forbidden"
}
$studentForbiddenCreateMock = Invoke-ApiExpectStatus -Method Post -Url "$baseUrl/mock-tests" -ExpectedStatus 403 -Headers $studentHeaders -Body @{
  title             = "Forbidden student mock"
  description       = "Student cannot create mock tests."
  type              = "mini-test"
  level             = "beginner"
  durationMinutes   = 15
  status            = "draft"
  instructions      = @("Instruction")
  assignedCourseIds = @()
  questions         = @(
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
  subject         = "Forbidden student message"
  content         = "Student cannot message another student."
}

$summary = [ordered]@{
  loginRole                        = $studentLogin.data.user.role
  meRole                           = $me.data.role
  publicCoursesCount               = @($courses.data).Count
  enrolledCoursesCount             = @($enrollments.data).Count
  learningCourseId                 = $learningCourseId
  learningLessonCount              = @($learning.data.lessons).Count
  learningProgressPercent          = $learning.data.enrollment.progressPercent
  mockTestsCount                   = @($mockTests.data).Count
  exerciseItemsCount               = @($exerciseItems.data).Count
  mockTestDetailHasCorrectAnswer   = $mockTestDetailHasCorrectAnswer
  mockTestSubmitSucceeded          = $mockTestSubmitSucceeded
  mockTestSubmitScore              = $mockTestSubmitScore
  mockTestSubmitError              = $mockTestSubmitError
  exerciseDetailHasCorrectAnswer   = $exerciseDetailHasCorrectAnswer
  exerciseSubmitSucceeded          = $exerciseSubmitSucceeded
  exerciseSubmitScore              = $exerciseSubmitScore
  exerciseSubmitError              = $exerciseSubmitError
  messageRecipientsCount           = @($messagesRecipients.data).Count
  unreadNotificationCount          = $notifications.data.unreadCount
  forbiddenAdminStats              = $studentForbiddenAdminStats
  forbiddenCreatePost              = $studentForbiddenCreatePost
  forbiddenCreateMockTest          = $studentForbiddenCreateMock
  forbiddenStudentToStudentMessage = $studentForbiddenStudentMessage
}

$summary | ConvertTo-Json -Depth 10

try {
  & $cleanupRunner -Context "Post-student-smoke"
} catch {}
