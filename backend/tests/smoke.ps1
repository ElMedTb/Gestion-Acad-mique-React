param(
  [string]$BaseUrl = "http://localhost:5000/api"
)

$ErrorActionPreference = "Stop"

function Write-Step($Text) {
  Write-Host ""
  Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Assert-True($Condition, $Message) {
  if (-not $Condition) {
    throw "FAIL: $Message"
  }
  Write-Host "PASS: $Message" -ForegroundColor Green
}

function Request-Json($Method, $Url, $Token = $null, $Body = $null) {
  $headers = @{}
  if ($Token) {
    $headers.Authorization = "Bearer $Token"
  }

  $params = @{
    Method = $Method
    Uri = $Url
    Headers = $headers
    ContentType = "application/json"
  }

  if ($Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  Invoke-RestMethod @params
}

function Expect-Status($Method, $Url, $ExpectedStatus, $Token = $null) {
  try {
    Request-Json $Method $Url $Token | Out-Null
    if ($ExpectedStatus -ge 400) {
      throw "Expected HTTP $ExpectedStatus but request succeeded"
    }
    Write-Host "PASS: $Method $Url -> success" -ForegroundColor Green
  } catch {
    $response = $_.Exception.Response
    if (-not $response) {
      throw
    }
    $statusCode = [int]$response.StatusCode
    if ($statusCode -ne $ExpectedStatus) {
      throw "FAIL: $Method $Url expected $ExpectedStatus got $statusCode"
    }
    Write-Host "PASS: $Method $Url -> $statusCode" -ForegroundColor Green
  }
}

function Login($Email) {
  try {
    $response = Request-Json "POST" "$BaseUrl/auth/login" $null @{
      email = $Email
      password = "password123"
    }
  } catch {
    throw "Login failed for $Email. Run 'npm run seed' after the latest seed fix, then retry the smoke test."
  }
  Assert-True $response.success "login $Email"
  return $response.data.token
}

Write-Step "Health"
$health = Request-Json "GET" "$BaseUrl/health"
Assert-True $health.success "API health endpoint"

Write-Step "Login roles"
$adminToken = Login "admin@academic.com"
$scolariteToken = Login "scolarite1@academic.com"
$studentToken = Login "student1@academic.com"
$teacherToken = Login "teacher1@academic.com"

Write-Step "Admin access"
Expect-Status "GET" "$BaseUrl/students" 200 $adminToken
Expect-Status "GET" "$BaseUrl/courses" 200 $adminToken
Expect-Status "GET" "$BaseUrl/ues" 200 $adminToken
Expect-Status "GET" "$BaseUrl/diplomas" 200 $adminToken
Expect-Status "GET" "$BaseUrl/teachers" 200 $adminToken
Expect-Status "GET" "$BaseUrl/grades" 200 $adminToken
Expect-Status "GET" "$BaseUrl/stats/admin" 200 $adminToken

Write-Step "Scolarite access"
Expect-Status "GET" "$BaseUrl/students" 200 $scolariteToken
Expect-Status "GET" "$BaseUrl/courses" 200 $scolariteToken
Expect-Status "GET" "$BaseUrl/grades" 200 $scolariteToken
Expect-Status "GET" "$BaseUrl/teachers" 200 $scolariteToken
Expect-Status "GET" "$BaseUrl/stats/scolarite" 200 $scolariteToken

Write-Step "Student restrictions"
Expect-Status "GET" "$BaseUrl/grades" 200 $studentToken
Expect-Status "GET" "$BaseUrl/diplomas" 200 $studentToken
Expect-Status "GET" "$BaseUrl/students" 403 $studentToken
Expect-Status "GET" "$BaseUrl/teachers" 403 $studentToken
Expect-Status "GET" "$BaseUrl/stats/admin" 403 $studentToken

Write-Step "Teacher restrictions"
Expect-Status "GET" "$BaseUrl/courses" 200 $teacherToken
Expect-Status "GET" "$BaseUrl/ues" 200 $teacherToken
Expect-Status "GET" "$BaseUrl/students" 403 $teacherToken
Expect-Status "GET" "$BaseUrl/stats/admin" 403 $teacherToken

Write-Host ""
Write-Host "All smoke tests passed." -ForegroundColor Green
