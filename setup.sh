#!/bin/bash

# =============================================================================
# LATTE'S PORTFOLIO - SETUP SCRIPT
# =============================================================================
# This script helps set up the simplified portfolio website

echo "🎨 Setting up Latte's Portfolio Website..."
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Build and start the application
echo "🚀 Building and starting the application..."
docker-compose up --build -d

# Wait a moment for the container to start
echo "⏳ Waiting for the application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Open your browser and go to: http://localhost:3000"
    echo ""
    echo "📋 Available endpoints:"
    echo "   - Website: http://localhost:3000"
    echo "   - Health Check: http://localhost:3000/api/health"
    echo "   - Contact API: http://localhost:3000/api/contact"
    echo ""
    echo "🛑 To stop the application, run: docker-compose down"
else
    echo "❌ Application failed to start. Check the logs with:"
    echo "   docker-compose logs"
fi

