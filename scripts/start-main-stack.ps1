$ErrorActionPreference = "Stop"
function Invoke-DockerCompose {
  param(
    [string[]]$Arguments
  )

  $process = Start-Process -FilePath "docker" -ArgumentList $Arguments -NoNewWindow -Wait -PassThru
  return $process.ExitCode
}

try {
  Set-Location (Join-Path $PSScriptRoot "..")
  $env:MYSQL_PORT = "3307"
  $composeArgs = @(
    "compose",
    "-f", "devops/docker/docker-compose.yml",
    "-f", "devops/docker/docker-compose.prod.yml",
    "-f", "devops/docker/docker-compose.dev.yml",
    "--env-file", "devops/env/.env.dev"
  )

  Write-Host "Resetting any existing containers before starting the main Spring stack..." -ForegroundColor Cyan
  $downExitCode = Invoke-DockerCompose -Arguments ($composeArgs + @("down", "--remove-orphans"))
  if ($downExitCode -ne 0) {
    throw "Failed to tear down the existing Docker stack."
  }

  Write-Host "Starting frontend + backend + mysql + nginx on the canonical stack..." -ForegroundColor Cyan
  $upExitCode = Invoke-DockerCompose -Arguments ($composeArgs + @("up", "-d", "--build", "mysql", "backend", "frontend", "nginx", "--remove-orphans"))
  if ($upExitCode -ne 0) {
    throw "Failed to start frontend + backend + mysql + nginx."
  }

  Write-Host "Main Spring stack requested successfully." -ForegroundColor Green
  Write-Host "- Web app: http://localhost" -ForegroundColor DarkGreen
  Write-Host "- Backend direct: http://localhost:5000" -ForegroundColor DarkGreen
  Write-Host "- MySQL host port: 3307" -ForegroundColor DarkGreen
} catch {
  Write-Error $_
  exit 1
}
