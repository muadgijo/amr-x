@echo off
echo ========================================
echo Starting AMR-X (Backend + Frontend)
echo ========================================
echo.

echo [1/2] Killing existing processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo [2/2] Starting both servers...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

concurrently "cd amrx-flask-backend && python app.py" "cd amrx && npm run dev" 