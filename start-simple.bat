@echo off
echo ========================================
echo Starting AMR-X (Backend + Frontend)
echo ========================================
echo.

echo [1/3] Killing existing processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo [2/3] Starting Backend (Port 5000)...
start "Backend" cmd /k "cd amrx-flask-backend && python app.py"

echo [3/3] Starting Frontend (Port 5173)...
start "Frontend" cmd /k "cd amrx && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to close this window...
pause >nul 