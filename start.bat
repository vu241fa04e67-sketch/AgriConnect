@echo off
echo ========================================================
echo        Starting AgriConnect Full-Stack System
echo ========================================================
echo.
echo Starting Backend API server on http://localhost:5000 ...
start "AgriConnect Backend Server" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Client on http://localhost:5173 ...
start "AgriConnect Frontend Client" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo AgriConnect is now launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo - Health:   http://localhost:5000/api/health
echo ========================================================
