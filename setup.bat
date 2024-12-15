@echo off
echo ==========================================
echo Setting up the project...
echo ==========================================

:: Navigate to frontend and install dependencies
echo Installing frontend dependencies...
cd frontend
start cmd /k "npm install"
if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies. Exiting setup.
    pause
    exit /b %errorlevel%
)
echo Frontend dependencies installed successfully.
cd ..

:: Navigate to backend and install dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies. Exiting setup.
    pause
    exit /b %errorlevel%
)
echo Backend dependencies installed successfully.
cd ..

echo ==========================================
echo Setup completed successfully!
echo ==========================================
pause
