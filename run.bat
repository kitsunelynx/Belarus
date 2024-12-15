@echo off
echo Starting the project...

:: Start the backend server
echo Starting backend server...
start cmd /k "cd backend && python main.py"

:: Start the frontend server
echo Starting frontend server...
start cmd /k "cd frontend && npm run dev"

echo Both servers are running.
pause
