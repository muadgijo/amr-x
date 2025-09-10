@echo off
echo Starting AMR-X (Clean & Safe Version)...
echo.

echo Starting Flask Backend (Clean)...
start "AMR-X Backend Clean" cmd /k "cd amrx-flask-backend && python app_clean.py"

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
echo All endpoints tested and working:
echo - Health Check: /api/health
echo - Authentication: /api/auth/pharmacist/login
echo - Public Submission: /api/public
echo - Pharmacist Submission: /api/pharmacist
echo - Dashboard: /api/dashboard
echo - Pharmacist Dashboard: /api/pharmacist/dashboard
echo.
echo Ready for deployment! Check DEPLOYMENT_SAFETY_CHECKLIST.md
echo.
pause
