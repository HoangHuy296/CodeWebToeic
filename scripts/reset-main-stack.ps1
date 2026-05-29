$ErrorActionPreference = "Stop"
$previousNativeCommandPreference = $null
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
  $previousNativeCommandPreference = $PSNativeCommandUseErrorActionPreference
  $global:PSNativeCommandUseErrorActionPreference = $false
}

try {
  Set-Location (Join-Path $PSScriptRoot "..")
  $env:MYSQL_PORT = "3307"

  Write-Host "Resetting the main Spring stack and database volume..." -ForegroundColor Yellow
  docker compose --profile prod --profile dev --profile mysql down -v --remove-orphans 2>$null | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to tear down the existing Docker stack."
  }

  Write-Host "Starting frontend + backend-dev + mysql + nginx on a clean database..." -ForegroundColor Cyan
  docker compose --profile prod --profile dev --profile mysql up -d mysql backend-dev frontend nginx --remove-orphans
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to start the clean Spring stack."
  }

  Write-Host "Clean main Spring stack requested successfully." -ForegroundColor Green
  Write-Host "- Web app: http://localhost" -ForegroundColor DarkGreen
  Write-Host "- Backend dev direct: http://localhost:5000" -ForegroundColor DarkGreen
  Write-Host "- MySQL host port: 3307" -ForegroundColor DarkGreen
} finally {
  if ($null -ne $previousNativeCommandPreference) {
    $global:PSNativeCommandUseErrorActionPreference = $previousNativeCommandPreference
  }
}
