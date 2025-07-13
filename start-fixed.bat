@echo off
echo Starting AMR-X Application...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ and try again
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install npm and try again
    pause
    exit /b 1
)

echo Checking dependencies...

REM Install backend dependencies
echo Installing backend dependencies...
cd amrx-flask-backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo Installing frontend dependencies...
cd ..\amrx
npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting services...

REM Start backend in a new window
echo Starting Flask backend on port 5000...
start "AMR-X Backend" cmd /k "cd /d %CD%\amrx-flask-backend && venv\Scripts\activate && python app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting React frontend on port 5173...
start "AMR-X Frontend" cmd /k "cd /d %CD%\amrx && npm run dev"

echo.
echo Services are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start http://localhost:5173

echo.
echo Application started successfully!
echo Keep these terminal windows open while using the application.
echo.
pause 