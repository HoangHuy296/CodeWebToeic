$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
$stackReadyScript = Join-Path $PSScriptRoot "assert-spring-stack-ready.ps1"
$baseUrl = & $stackReadyScript -PassThruUrl

function Invoke-ApiJson {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [object]$Body
  )

  $params = @{
    Method      = $Method
    Uri         = $Url
    TimeoutSec  = 20
    ErrorAction = "Stop"
  }

  if ($null -ne $Body) {
    $params.ContentType = "application/json"
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  Invoke-RestMethod @params
}

function Invoke-ApiExpectError {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][int]$ExpectedStatus,
    [Parameter(Mandatory = $true)][string]$ExpectedCode,
    [object]$Body
  )

  try {
    $null = Invoke-ApiJson -Method $Method -Url $Url -Body $Body
    throw "Expected HTTP $ExpectedStatus with code $ExpectedCode but request succeeded."
  } catch {
    $response = $_.Exception.Response
    if ($null -eq $response) {
      throw
    }

    $statusCode = [int]$response.StatusCode
    if ($statusCode -ne $ExpectedStatus) {
      throw "Expected HTTP $ExpectedStatus but received $statusCode"
    }

    $stream = $response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $bodyText = $reader.ReadToEnd()
    $reader.Dispose()
    $stream.Dispose()

    $payload = $bodyText | ConvertFrom-Json
    if ($payload.code -ne $ExpectedCode) {
      throw "Expected error code $ExpectedCode but received $($payload.code)"
    }

    return $payload
  }
}

Write-Host "Running google-auth smoke test on Spring + MySQL..." -ForegroundColor Cyan

$loginPageStatus = (Invoke-WebRequest -Method Get -Uri (($baseUrl -replace '/api$','') + "/login") -TimeoutSec 20 -UseBasicParsing).StatusCode

$adminForbidden = Invoke-ApiExpectError -Method Post -Url "$baseUrl/auth/google" -ExpectedStatus 403 -ExpectedCode "GOOGLE_ROLE_NOT_ALLOWED" -Body @{
  credential   = "invalid-google-token"
  intendedRole = "admin"
}

$invalidToken = Invoke-ApiExpectError -Method Post -Url "$baseUrl/auth/google" -ExpectedStatus 401 -ExpectedCode "GOOGLE_TOKEN_INVALID" -Body @{
  credential   = "invalid-google-token"
  intendedRole = "student"
}

$invalidRole = Invoke-ApiExpectError -Method Post -Url "$baseUrl/auth/google" -ExpectedStatus 400 -ExpectedCode "GOOGLE_ROLE_INVALID" -Body @{
  credential   = "invalid-google-token"
  intendedRole = "guest"
}

$summary = [ordered]@{
  baseUrl                  = $baseUrl
  loginPageStatus          = [int]$loginPageStatus
  adminBlockedStatus       = 403
  adminBlockedCode         = $adminForbidden.code
  invalidTokenStatus       = 401
  invalidTokenCode         = $invalidToken.code
  invalidRoleStatus        = 400
  invalidRoleCode          = $invalidRole.code
}

$summary | ConvertTo-Json -Depth 10
