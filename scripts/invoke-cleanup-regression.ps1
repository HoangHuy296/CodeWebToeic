param(
  [string]$Context = "Regression"
)

$cleanupScript = Join-Path $PSScriptRoot "cleanup-regression.ps1"

try {
  & $cleanupScript
} catch {
  $message = $_.Exception.Message
  if ($message -match "permission denied while trying to connect to the docker API") {
    Write-Host "$Context cleanup skipped because Docker CLI is not available in this shell." -ForegroundColor Yellow
    return
  }

  Write-Warning "$Context cleanup could not complete automatically: $message"
}
