@echo off
echo Starting AMR-X (Simplified Version)...
echo.

echo Starting Flask Backend (Simple)...
start "AMR-X Backend Simple" cmd /k "cd amrx-flask-backend && python app_simple.py"

echo Starting React Frontend...
start "AMR-X Frontend" cmd /k "cd amrx && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Demo Credentials:
echo Email: demo@amrx.com
echo Password: demo123
echo.
pause
