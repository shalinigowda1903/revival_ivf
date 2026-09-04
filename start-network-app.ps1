$ErrorActionPreference = "Stop"

$root = "C:\Users\Shalini B A\projects\revival_ivf"
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$python = Join-Path $root ".venv\Scripts\python.exe"
$lanIp = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notmatch '^(127\.|169\.254\.)' } |
    Select-Object -First 1 -ExpandProperty IPAddress

if (-not $lanIp) {
    $lanIp = "localhost"
}

foreach ($port in 3000, 8001) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        if ($connection.OwningProcess) {
            Write-Host "Stopping stale process on port $port (PID $($connection.OwningProcess))"
            Stop-Process -Id $connection.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Sleep -Seconds 2

Write-Host "Starting Revival IVF backend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$backend'; & '$python' -m uvicorn main:app --host 0.0.0.0 --port 8001"
)

Start-Sleep -Seconds 3

Write-Host "Starting Revival IVF frontend..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$frontend'; npm.cmd run dev -- --hostname 0.0.0.0 --port 3000"
)

Write-Host ""
Write-Host "Open the app at: http://$lanIp`:3000"
Write-Host "API docs: http://$lanIp`:8001/docs"
Write-Host "Doctor login: doctor@revivalivf.com / RevivalIVF@123"

Write-Host ""
Write-Host "Opening browser in 5 seconds..."
Start-Sleep -Seconds 5

Start-Process "http://localhost:3000"

Write-Host "Browser opened!"
