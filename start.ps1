Write-Host "========================================================" -ForegroundColor Green
Write-Host "       Starting AgriConnect Full-Stack System" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "`nStarting Backend API on http://localhost:5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend Client on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "AgriConnect is running!" -ForegroundColor Green
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "- Backend:  http://localhost:5000" -ForegroundColor Yellow
Write-Host "- Health:   http://localhost:5000/api/health" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Green
