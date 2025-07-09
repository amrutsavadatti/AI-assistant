#!/bin/bash

# AI Assistant Full Stack - Development Startup Script

echo "🚀 Starting AI Assistant Full Stack (Development Mode)"
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env file exists and warn about API key
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Make sure to set OPENAI_API_KEY environment variable."
    echo "   You can create a .env file with:"
    echo "   OPENAI_API_KEY=your_api_key_here"
    echo "   REDIS_PASSWORD=your_secure_password"
    echo ""
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down > /dev/null 2>&1

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check frontend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Frontend is healthy at http://localhost:3000"
else
    echo "❌ Frontend health check failed"
fi

# Check backend via proxy
if curl -f http://localhost:3000/api/docs > /dev/null 2>&1; then
    echo "✅ Backend API is healthy at http://localhost:3000/api"
else
    echo "⚠️  Backend API health check failed - check if OPENAI_API_KEY is set"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "📱 Frontend (Portfolio): http://localhost:3000"
echo "🤖 API (via proxy):      http://localhost:3000/api"
echo "🔧 Backend (direct):     http://localhost:8000"
echo "📚 API Docs:             http://localhost:3000/api/docs"
echo ""
echo "📋 Useful Commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:       docker-compose restart"
echo ""
echo "Happy coding! 🚀" 