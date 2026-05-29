$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")

$env:MYSQL_PORT = "3307"

Write-Host "Resetting any existing prod/dev containers that can interfere with the dev Spring stack..." -ForegroundColor Cyan
docker compose --profile prod --profile dev --profile mysql down --remove-orphans *> $null

Write-Host "Starting mysql + backend-dev + frontend-dev..." -ForegroundColor Cyan
docker compose --profile dev --profile mysql up -d mysql backend-dev frontend-dev --remove-orphans

Write-Host "Dev full stack requested successfully." -ForegroundColor Green
Write-Host "- Frontend dev: http://localhost:5173" -ForegroundColor DarkGreen
Write-Host "- Backend dev: http://localhost:5000" -ForegroundColor DarkGreen
Write-Host "- MySQL host port: 3307" -ForegroundColor DarkGreen
