# AstraLearn - Start Both Servers
# Run this script to start backend and frontend simultaneously

Write-Host "🚀 Starting AstraLearn LMS..." -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Yellow
    exit 1
}

# Start Backend Server in new window
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Projects\astralearn\server; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server in new window
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\Projects\astralearn\client; Write-Host '⚡ Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check the new terminal windows for server output" -ForegroundColor Cyan
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
