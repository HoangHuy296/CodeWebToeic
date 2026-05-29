param(
  [string]$ApiBaseUrl,
  [switch]$PassThruUrl
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ApiBaseUrl)) {
  $candidateBaseUrls = @(
    "http://localhost/api",
    "http://localhost:5000/api"
  )
} else {
  $candidateBaseUrls = @($ApiBaseUrl)
}

$resolvedBaseUrl = $null

foreach ($candidateBaseUrl in $candidateBaseUrls) {
  try {
    $health = Invoke-RestMethod -Method Get -Uri "$candidateBaseUrl/health" -TimeoutSec 5 -ErrorAction Stop
    if (-not $health.success) {
      throw "Health endpoint returned an unexpected payload."
    }

    $resolvedBaseUrl = $candidateBaseUrl
    break
  } catch {
    continue
  }
}

if (-not $resolvedBaseUrl) {
  $displayBaseUrl = if ([string]::IsNullOrWhiteSpace($ApiBaseUrl)) {
    "http://localhost/api or http://localhost:5000/api"
  } else {
    $ApiBaseUrl
  }

  throw @"
Spring + MySQL stack is not reachable at $displayBaseUrl.

Expected:
- Docker Desktop Service is running
- containers mysql and backend-dev are healthy
- nginx is healthy when you want to test through http://localhost/api

Try:
1. Start Docker Desktop
2. Run npm run dev
3. Re-run the smoke/regression command
"@
}

if ($PassThruUrl) {
  $resolvedBaseUrl
}
