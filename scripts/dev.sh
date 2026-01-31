#!/bin/bash

# Shiv Furniture - Start Development Environment

set -e

echo "🚀 Starting Shiv Furniture Development Environment"
echo "==================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL
echo ""
echo "📦 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database..."
sleep 3

# Start backend
echo ""
echo "🖥️  Starting backend server..."
cd backend
npm run dev &

echo ""
echo "✅ Development environment started!"
echo ""
echo "🔗 Services:"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop the server"
