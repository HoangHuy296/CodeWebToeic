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

$cleanupRunner = Join-Path $PSScriptRoot "invoke-cleanup-regression.ps1"
$teacherKey = [guid]::NewGuid().ToString("N").Substring(0, 10)

Write-Host "Running teacher exercise workspace smoke test..." -ForegroundColor Cyan
try {
  & $cleanupRunner -Context "Pre-teacher-exercise-smoke"
} catch {}

try {
  $teacherLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "teacher@ivyts.dev"
    password = "Password@123"
  }

  $teacherHeaders = @{ Authorization = "Bearer $($teacherLogin.data.accessToken)" }
  $exerciseTopics = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/topics" -Headers $teacherHeaders
  if (@($exerciseTopics.data).Count -eq 0) {
    throw "No exercise topics available for teacher exercise smoke test."
  }

  $selectedTopic = $exerciseTopics.data[0]
  $createdExercise = Invoke-ApiJson -Method Post -Url "$baseUrl/exercises/items" -Headers $teacherHeaders -Body @{
    title             = "Teacher Exercise Workspace $teacherKey"
    description       = "Teacher exercise workspace smoke $teacherKey"
    type              = "practice-set"
    level             = "intermediate"
    durationMinutes   = 14
    status            = "draft"
    instructions      = @("Teacher exercise workspace")
    assignedCourseIds = @()
    catalogKind       = "exercise"
    exerciseTopicSlug = $selectedTopic.slug
    questions         = @(
      @{
        section       = "reading"
        prompt        = "Teacher exercise workspace prompt"
        explanation   = "Teacher exercise workspace explanation"
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

  $detail = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items/$($createdExercise.data.id)" -Headers $teacherHeaders
  $manageExercises = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items/manage/mine" -Headers $teacherHeaders
  $publicTopicItems = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items?topicSlug=$($selectedTopic.slug)" -Headers $teacherHeaders

  $updatedExercise = Invoke-ApiJson -Method Patch -Url "$baseUrl/exercises/items/$($createdExercise.data.id)" -Headers $teacherHeaders -Body @{
    title             = "Teacher Exercise Workspace Updated $teacherKey"
    description       = "Teacher exercise workspace updated $teacherKey"
    type              = "practice-set"
    level             = "advanced"
    durationMinutes   = 16
    status            = "published"
    instructions      = @("Teacher exercise workspace updated")
    assignedCourseIds = @()
    catalogKind       = "exercise"
    exerciseTopicSlug = $selectedTopic.slug
    questions         = @(
      @{
        section       = "reading"
        prompt        = "Teacher exercise workspace updated prompt"
        explanation   = "Teacher exercise workspace updated explanation"
        options       = @(
          @{ key = "A"; text = "Option A"; isCorrect = $false },
          @{ key = "B"; text = "Option B"; isCorrect = $true },
          @{ key = "C"; text = "Option C"; isCorrect = $false },
          @{ key = "D"; text = "Option D"; isCorrect = $false }
        )
        correctAnswer = "B"
        points        = 1
        order         = 1
        level         = "easy"
      }
    )
  }

  Invoke-ApiJson -Method Delete -Url "$baseUrl/exercises/items/$($createdExercise.data.id)" -Headers $teacherHeaders | Out-Null
  $manageExercisesAfterDelete = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items/manage/mine" -Headers $teacherHeaders

  [ordered]@{
    teacherRole                = $teacherLogin.data.user.role
    exerciseTopicsCount        = @($exerciseTopics.data).Count
    selectedTopicSlug          = $selectedTopic.slug
    createdExerciseCatalogKind = $createdExercise.data.catalogKind
    detailTopicSlug            = $detail.data.exerciseTopicSlug
    manageContainsExercise     = (@($manageExercises.data | Where-Object { $_.id -eq $createdExercise.data.id }).Count -gt 0)
    publicTopicContainsItem    = (@($publicTopicItems.data | Where-Object { $_.id -eq $createdExercise.data.id }).Count -gt 0)
    updatedExerciseStatus      = $updatedExercise.data.status
    updatedExerciseLevel       = $updatedExercise.data.level
    deletedFromManage          = (@($manageExercisesAfterDelete.data | Where-Object { $_.id -eq $createdExercise.data.id }).Count -eq 0)
  } | ConvertTo-Json -Depth 10
}
finally {
  try {
    & $cleanupRunner -Context "Post-teacher-exercise-smoke"
  } catch {}
}
