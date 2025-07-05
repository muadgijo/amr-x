@echo off
echo Starting AMR-X Backend and Frontend...
echo.

echo Starting Flask Backend...
start "AMR-X Backend" cmd /k "cd amrx-flask-backend && python app.py"

echo Starting React Frontend...
start "AMR-X Frontend" cmd /k "cd amrx && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause 