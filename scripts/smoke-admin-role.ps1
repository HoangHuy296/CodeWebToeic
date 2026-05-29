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
$adminKey = [guid]::NewGuid().ToString("N").Substring(0, 10)
$postId = $null
$updatedTeacherUserId = "teachermysql001"
$teacherOriginalBio = $null

Write-Host "Running admin-role smoke test on Spring + MySQL..." -ForegroundColor Cyan
try {
  & $cleanupRunner -Context "Pre-admin-smoke"
} catch {}

try {
  $rootUrl = if ($baseUrl -like "http://localhost/api*") {
    "http://localhost/"
  } else {
    "http://localhost:5000/"
  }
  $root = Invoke-ApiJson -Method Get -Url $rootUrl
  $health = Invoke-ApiJson -Method Get -Url "$baseUrl/health"
  $login = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
    email    = "admin@ivyts.dev"
    password = "Password@123"
  }
  $headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

  $me = Invoke-ApiJson -Method Get -Url "$baseUrl/auth/me" -Headers $headers
  $stats = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/stats" -Headers $headers
  $revenueChart = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/charts/revenue" -Headers $headers
  $enrollmentChart = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/charts/enrollments" -Headers $headers
  $users = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/users" -Headers $headers
  $teacherUser = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/users/$updatedTeacherUserId" -Headers $headers
  $teacherOriginalBio = $teacherUser.data.bio

  $updatedTeacher = Invoke-ApiJson -Method Patch -Url "$baseUrl/admin/users/$updatedTeacherUserId" -Headers $headers -Body @{
    fullName = $teacherUser.data.fullName
    role     = $teacherUser.data.role
    bio      = "Admin smoke teacher bio $adminKey"
  }

  $postSlug = "admin-smoke-post-$adminKey"
  $createdPost = Invoke-ApiJson -Method Post -Url "$baseUrl/posts" -Headers $headers -Body @{
    title          = "Admin Smoke Post $adminKey"
    excerpt        = "Admin smoke excerpt $adminKey"
    content        = "Admin smoke content $adminKey"
    status         = "draft"
    tags           = @("admin", "smoke", $adminKey)
    seoDescription = "Admin smoke post"
    slug           = $postSlug
  }
  $postId = $createdPost.data.id

  $updatedPost = Invoke-ApiJson -Method Patch -Url "$baseUrl/posts/$postId" -Headers $headers -Body @{
    status  = "published"
    excerpt = "Admin smoke excerpt updated $adminKey"
  }
  $publicPost = Invoke-ApiJson -Method Get -Url "$baseUrl/posts/$postSlug"

  $messages = Invoke-ApiJson -Method Get -Url "$baseUrl/messages" -Headers $headers
  $recipients = Invoke-ApiJson -Method Get -Url "$baseUrl/messages/recipients" -Headers $headers
  $internalMessage = Invoke-ApiJson -Method Post -Url "$baseUrl/messages/internal" -Headers $headers -Body @{
    recipientUserId = "teachermysql001"
    subject         = "Admin smoke message $adminKey"
    content         = "Admin smoke message body $adminKey"
  }
  $markedMessage = Invoke-ApiJson -Method Patch -Url "$baseUrl/messages/$($internalMessage.data.id)/read" -Headers $headers -Body @{
    status = "replied"
  }

  $notifications = Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $headers
  $markAllNotifications = Invoke-ApiJson -Method Patch -Url "$baseUrl/notifications/read-all" -Headers $headers

  $mockTests = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests" -Headers $headers
  $mockTestDetailHasCorrectAnswer = $false
  if (@($mockTests.data).Count -gt 0) {
    $mockDetail = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests/$($mockTests.data[0].id)" -Headers $headers
    $mockTestDetailHasCorrectAnswer = ($mockDetail.data.questions | ConvertTo-Json -Depth 10) -match "correctAnswer"
  }

  $adminUnreadAfterMarkAll = (Invoke-ApiJson -Method Get -Url "$baseUrl/notifications" -Headers $headers).data.unreadCount

  $summary = [ordered]@{
    rootStatus                     = $root.success
    healthService                  = $health.data.service
    loginRole                      = $login.data.user.role
    meRole                         = $me.data.role
    statsPublishedCourses          = $stats.data.content.publishedCourses
    revenueChartPoints             = @($revenueChart.data).Count
    enrollmentChartPoints          = @($enrollmentChart.data).Count
    adminUsersCount                = @($users.data).Count
    updatedTeacherBio              = $updatedTeacher.data.bio
    createdPostStatus              = $createdPost.data.status
    updatedPostStatus              = $updatedPost.data.status
    publicPostSlug                 = $publicPost.data.slug
    messagesCount                  = @($messages.data).Count
    recipientsCount                = @($recipients.data).Count
    internalMessageStatus          = $internalMessage.data.status
    markedMessageStatus            = $markedMessage.data.status
    unreadNotificationsBeforeMark  = $notifications.data.unreadCount
    markAllUpdatedCount            = $markAllNotifications.data.updatedCount
    unreadNotificationsAfterMark   = $adminUnreadAfterMarkAll
    mockTestDetailHasCorrectAnswer = $mockTestDetailHasCorrectAnswer
  }

  $summary | ConvertTo-Json -Depth 10
}
finally {
  if ($teacherOriginalBio -ne $null) {
    try {
      $restoreLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
        email    = "admin@ivyts.dev"
        password = "Password@123"
      }
      $restoreHeaders = @{ Authorization = "Bearer $($restoreLogin.data.accessToken)" }
      $teacherUserForRestore = Invoke-ApiJson -Method Get -Url "$baseUrl/admin/users/$updatedTeacherUserId" -Headers $restoreHeaders
      Invoke-ApiJson -Method Patch -Url "$baseUrl/admin/users/$updatedTeacherUserId" -Headers $restoreHeaders -Body @{
        fullName = $teacherUserForRestore.data.fullName
        role     = $teacherUserForRestore.data.role
        bio      = $teacherOriginalBio
      } | Out-Null
    } catch {
      Write-Warning "Could not restore teacher bio automatically: $($_.Exception.Message)"
    }
  }

  if ($postId) {
    try {
      $deleteLogin = Invoke-ApiJson -Method Post -Url "$baseUrl/auth/login" -Body @{
        email    = "admin@ivyts.dev"
        password = "Password@123"
      }
      $deleteHeaders = @{ Authorization = "Bearer $($deleteLogin.data.accessToken)" }
      Invoke-ApiJson -Method Delete -Url "$baseUrl/posts/$postId" -Headers $deleteHeaders | Out-Null
    } catch {
      Write-Warning "Could not delete admin smoke post automatically: $($_.Exception.Message)"
    }
  }

  try {
    & $cleanupRunner -Context "Post-admin-smoke"
  } catch {}
}
