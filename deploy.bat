@echo off
REM FocusFlow Deployment Script for Windows

echo.
echo 🚀 FocusFlow Deployment Starting...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed.
    pause
    exit /b 1
)

echo 📦 Building and starting containers...
docker-compose up --build -d

echo ⏳ Waiting for services to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ✨ FocusFlow is ready!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend API: http://localhost:8080/api
echo 📚 Swagger Docs: http://localhost:8080/api/swagger-ui.html
echo.
echo 📝 Admin Credentials:
echo Email: admin@focusflow.com
echo Password: admin123
echo.
echo To view logs: docker logs focusflow-backend
echo To stop: docker-compose down
echo.
pause
