#!/usr/bin/env pwsh
# PSW Booking System - Quick Setup Script for Windows

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PSW Booking System - Setup Script        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($?) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Create environment files
Write-Host "Setting up environment files..." -ForegroundColor Yellow

if (!(Test-Path "frontend/.env")) {
    Copy-Item "frontend/.env.example" "frontend/.env"
    Write-Host "✓ Created frontend/.env" -ForegroundColor Green
} else {
    Write-Host "✓ frontend/.env already exists" -ForegroundColor Green
}

if (!(Test-Path "backend/.env")) {
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "✓ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($?) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($?) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Complete!                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend/.env with your API keys"
Write-Host "   - FIREBASE_PROJECT_ID"
Write-Host "   - FIREBASE_PRIVATE_KEY"
Write-Host "   - FIREBASE_CLIENT_EMAIL"
Write-Host "   - OPENAI_API_KEY"
Write-Host "   - GOOGLE_MAPS_API_KEY"
Write-Host ""
Write-Host "2. Edit frontend/.env with your API keys"
Write-Host "   - VITE_API_URL"
Write-Host "   - VITE_GOOGLE_MAPS_API_KEY"
Write-Host ""
Write-Host "3. Start development servers:"
Write-Host "   Terminal 1: cd backend && npm run dev"
Write-Host "   Terminal 2: cd frontend && npm run dev"
Write-Host ""
Write-Host "4. Access at http://localhost:3000"
Write-Host ""
Write-Host "For more information, see docs/README.md" -ForegroundColor Cyan
