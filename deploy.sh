#!/bin/bash

# FocusFlow Deployment Script

echo "🚀 FocusFlow Deployment Starting..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start containers
echo "📦 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if containers are running
if docker ps | grep -q focusflow-backend; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    docker logs focusflow-backend
    exit 1
fi

if docker ps | grep -q focusflow-frontend; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    docker logs focusflow-frontend
    exit 1
fi

if docker ps | grep -q focusflow-db; then
    echo "✅ Database is running"
else
    echo "❌ Database failed to start"
    docker logs focusflow-db
    exit 1
fi

if docker ps | grep -q focusflow-redis; then
    echo "✅ Redis is running"
else
    echo "❌ Redis failed to start"
    docker logs focusflow-redis
    exit 1
fi

echo ""
echo "✨ FocusFlow is ready!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8080/api"
echo "📚 Swagger Docs: http://localhost:8080/api/swagger-ui.html"
echo ""
echo "📝 Admin Credentials:"
echo "Email: admin@focusflow.com"
echo "Password: admin123"
