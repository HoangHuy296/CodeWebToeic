$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http

Set-Location (Join-Path $PSScriptRoot "..")
$stackReadyScript = Join-Path $PSScriptRoot "assert-spring-stack-ready.ps1"
$baseUrl = & $stackReadyScript -PassThruUrl
$origin = if ($baseUrl -like "http://localhost:5000/api") { "http://localhost:5000" } else { "http://localhost" }

function Invoke-ApiJson {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url
  )

  Invoke-RestMethod -Method $Method -Uri $Url -TimeoutSec 20 -ErrorAction Stop
}

function Invoke-PageStatus {
  param(
    [Parameter(Mandatory = $true)][string]$Url
  )

  $handler = New-Object System.Net.Http.HttpClientHandler
  $handler.AllowAutoRedirect = $true
  $client = New-Object System.Net.Http.HttpClient($handler)
  $client.Timeout = [TimeSpan]::FromSeconds(20)

  try {
    $response = $client.GetAsync($Url).GetAwaiter().GetResult()
    [int]$response.StatusCode
  } finally {
    $client.Dispose()
    $handler.Dispose()
  }
}

Write-Host "Running guest-role smoke test on Spring + MySQL..." -ForegroundColor Cyan

$rootPageStatus = Invoke-PageStatus -Url "$origin/"
$coursesPageStatus = Invoke-PageStatus -Url "$origin/courses"
$blogPageStatus = Invoke-PageStatus -Url "$origin/blog"
$mockTestPageStatus = Invoke-PageStatus -Url "$origin/mock-test"
$exercisesPageStatus = Invoke-PageStatus -Url "$origin/exercises"
$portfolioPageStatus = Invoke-PageStatus -Url "$origin/portfolio"

$courses = Invoke-ApiJson -Method Get -Url "$baseUrl/courses"
$posts = Invoke-ApiJson -Method Get -Url "$baseUrl/posts"
$mockTests = Invoke-ApiJson -Method Get -Url "$baseUrl/mock-tests"
$exerciseTopics = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/topics"
$exerciseItems = Invoke-ApiJson -Method Get -Url "$baseUrl/exercises/items"

$summary = [ordered]@{
  origin                    = $origin
  rootPageStatus            = $rootPageStatus
  coursesPageStatus         = $coursesPageStatus
  blogPageStatus            = $blogPageStatus
  mockTestPageStatus        = $mockTestPageStatus
  exercisesPageStatus       = $exercisesPageStatus
  portfolioPageStatus       = $portfolioPageStatus
  publicCoursesCount        = @($courses.data).Count
  publicPostsCount          = @($posts.data).Count
  publicMockTestsCount      = @($mockTests.data).Count
  publicExerciseTopicsCount = @($exerciseTopics.data).Count
  publicExerciseItemsCount  = @($exerciseItems.data).Count
  homeIsStaticMarketing     = $true
  portfolioIsStaticMarketing = $true
}

$summary | ConvertTo-Json -Depth 10
