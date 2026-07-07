@echo off
REM =============================================================================
REM LATTE'S PORTFOLIO - WINDOWS SETUP SCRIPT
REM =============================================================================
REM This script helps set up the simplified portfolio website on Windows

echo 🎨 Setting up Latte's Portfolio Website...
echo =============================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    echo    Visit: https://docs.docker.com/compose/install/
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Build and start the application
echo 🚀 Building and starting the application...
docker-compose up --build -d

REM Wait a moment for the container to start
echo ⏳ Waiting for the application to start...
timeout /t 10 /nobreak >nul

REM Check if the application is running
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is running successfully!
    echo 🌐 Open your browser and go to: http://localhost:3000
    echo.
    echo 📋 Available endpoints:
    echo    - Website: http://localhost:3000
    echo    - Health Check: http://localhost:3000/api/health
    echo    - Contact API: http://localhost:3000/api/contact
    echo.
    echo 🛑 To stop the application, run: docker-compose down
    echo.
    echo 🎉 Setup complete! Press any key to open the website...
    pause >nul
    start http://localhost:3000
) else (
    echo ❌ Application failed to start. Check the logs with:
    echo    docker-compose logs
    pause
)



