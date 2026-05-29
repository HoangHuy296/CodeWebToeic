$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
$env:MYSQL_PORT = "3307"

function Invoke-DockerCompose {
  param(
    [string[]]$Arguments
  )

  $process = Start-Process -FilePath "docker" -ArgumentList $Arguments -NoNewWindow -Wait -PassThru
  return $process.ExitCode
}

try {
  Write-Host "Resetting Spring dev stack and re-applying Flyway seed on mysql + backend-dev..." -ForegroundColor Cyan

  $downExitCode = Invoke-DockerCompose -Arguments @(
    "compose",
    "--profile", "prod",
    "--profile", "dev",
    "--profile", "mysql",
    "down",
    "-v",
    "--remove-orphans"
  )
  if ($downExitCode -ne 0) {
    throw "Failed to tear down the existing Docker stack before seeding."
  }

  $upExitCode = Invoke-DockerCompose -Arguments @(
    "compose",
    "--profile", "prod",
    "--profile", "dev",
    "--profile", "mysql",
    "up",
    "-d",
    "mysql",
    "backend-dev",
    "frontend",
    "nginx",
    "--remove-orphans"
  )
  if ($upExitCode -ne 0) {
    throw "Failed to start mysql + backend-dev + frontend + nginx for seeding."
  }

  Write-Host "Waiting for backend health..." -ForegroundColor Cyan

  $healthUrl = "http://localhost/api/health"
  $maxAttempts = 60
  for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    try {
      $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 5
      if ($response.success -eq $true) {
        Write-Host "Spring + MySQL seed is ready." -ForegroundColor Green
        exit 0
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  Write-Error "Backend did not become healthy after reset."
} catch {
  Write-Error $_
  exit 1
}
