@echo off
echo ===================================
echo Blog Management System - Dev Start
echo ===================================

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking MongoDB connection...
mongod --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: MongoDB not found locally. Make sure MongoDB is running or configure MongoDB Atlas.
    echo Continuing with setup...
)

echo.
echo Setting up Backend...
cd backend

echo Installing backend dependencies...
npm install

echo Checking for .env file...
if not exist .env (
    if exist env.example (
        echo Creating .env file from template...
        copy env.example .env
        echo IMPORTANT: Please edit .env file with your MongoDB connection string and JWT secret!
    ) else (
        echo ERROR: env.example template not found!
    )
)

echo.
echo Setting up Frontend...
cd ../frontend

echo Installing frontend dependencies...
npm install

echo.
echo ===================================
echo Setup Complete!
echo ===================================
echo.
echo Next steps:
echo 1. Edit backend/.env with your MongoDB connection and JWT secret
echo 2. Start MongoDB (if using local installation)
echo 3. Run: npm run dev (from backend directory)
echo 4. Run: npm start (from frontend directory in another terminal)
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see setup-instructions.md
echo.
pause
