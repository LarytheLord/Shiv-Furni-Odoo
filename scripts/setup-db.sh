#!/bin/bash

# Shiv Furniture - Database Setup Script
# This script sets up the database using Docker and runs migrations

set -e

echo "🚀 Shiv Furniture Database Setup"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL container
echo ""
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if database is healthy
until docker exec shiv_furniture_db pg_isready -U shiv_admin -d shiv_furniture_db > /dev/null 2>&1; do
    echo "   Waiting for database..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Change to backend directory
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing backend dependencies..."
    npm install
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npm run prisma:generate

# Run migrations
echo ""
echo "📊 Running database migrations..."
npm run prisma:migrate

# Seed database
echo ""
echo "🌱 Seeding database with demo data..."
npm run prisma:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📋 Login Credentials:"
echo "   Admin: admin@shivfurniture.com / Admin@123"
echo "   Portal: portal@grandhotel.com / Portal@123"
echo ""
echo "🔗 Database Access:"
echo "   PostgreSQL: localhost:5432"
echo "   pgAdmin: http://localhost:5050 (run 'docker-compose up -d pgadmin')"
