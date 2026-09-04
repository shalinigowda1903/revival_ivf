$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if (-not $root) {
    $root = (Get-Location).Path
}

$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

$python = Join-Path $backend ".venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    $python = Join-Path $root ".venv\Scripts\python.exe"
}
if (-not (Test-Path $python)) {
    $pyCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pyCmd) {
        $python = $pyCmd.Source
    } else {
        $python = "python"
    }
}

$lanIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' -and $_.InterfaceAlias -notmatch 'vEthernet|Loopback' } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $lanIp) {
    $lanIp = "localhost"
}

Write-Host "=========================================="
Write-Host "  Revival IVF Network App Launcher"
Write-Host "=========================================="
Write-Host "Root Directory : $root"
Write-Host "Python Path    : $python"
Write-Host "LAN IP         : $lanIp"
Write-Host "=========================================="

foreach ($port in 3000, 8001) {
    $pidsToKill = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pidsToKill) {
        if ($p -and $p -ne 0 -and $p -ne $PID) {
            Write-Host "Stopping stale process on port $port (PID $p)"
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 1

Write-Host "Starting Revival IVF backend (Port 8001)..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$host.ui.RawUI.WindowTitle = 'Revival IVF Backend (Port 8001)'; Set-Location '$backend'; & '$python' -m uvicorn main:app --host 0.0.0.0 --port 8001"
)

Start-Sleep -Seconds 2

Write-Host "Starting Revival IVF frontend (Port 3000)..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "`$host.ui.RawUI.WindowTitle = 'Revival IVF Frontend (Port 3000)'; Set-Location '$frontend'; npm.cmd run dev -- --hostname 0.0.0.0 --port 3000"
)

Write-Host ""
Write-Host "--------------------------------------------------"
Write-Host "Local URL    : http://localhost:3000"
Write-Host "Network URL  : http://$lanIp`:3000"
Write-Host "API Docs     : http://$lanIp`:8001/docs"
Write-Host "Doctor Login : doctor@revivalivf.com / RevivalIVF@123"
Write-Host "--------------------------------------------------"
Write-Host ""

Write-Host "Waiting for frontend server to be ready..."
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response -and $response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            $ready = $true
            break
        }
    } catch {
        # Keep waiting
    }
}

Write-Host "Opening browser..."
Start-Process "http://localhost:3000"
Write-Host "Revival IVF is up and running!"

