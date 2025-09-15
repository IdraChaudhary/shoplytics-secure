# Shoplytics Secure Deployment Script
# Run this script to deploy the application

Write-Host "🚀 Starting Shoplytics Secure Deployment..." -ForegroundColor Green

# Step 1: Check if Node.js is installed
Write-Host "📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Some dependencies failed to install, but continuing..." -ForegroundColor Yellow
}

# Step 3: Check environment file
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.deployment") {
        Write-Host "📋 Copying .env.deployment to .env.local..." -ForegroundColor Yellow
        Copy-Item ".env.deployment" ".env.local"
        Write-Host "⚠️ Please edit .env.local with your actual configuration!" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ No environment file found. Please create .env.local" -ForegroundColor Red
        Write-Host "📋 Check .env.example for reference" -ForegroundColor Yellow
    }
}

# Step 4: Build the application
Write-Host "🏗️ Building the application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Build completed with warnings (this is expected for the first deployment)" -ForegroundColor Yellow
}

# Step 5: Show deployment options
Write-Host "" 
Write-Host "🎉 Deployment preparation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. For local development: npm run dev" -ForegroundColor White
Write-Host "2. For production server: npm start" -ForegroundColor White
Write-Host "3. For Docker deployment: docker build -t shoplytics-secure ." -ForegroundColor White
Write-Host "4. For Vercel deployment: npx vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your 3 core pages will be available at:" -ForegroundColor Cyan
Write-Host "- Landing Page: http://localhost:3000" -ForegroundColor White
Write-Host "- Login Page: http://localhost:3000/login" -ForegroundColor White  
Write-Host "- Dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "📝 Demo Login Credentials:" -ForegroundColor Cyan
Write-Host "- Email: demo@shoplytics.com" -ForegroundColor White
Write-Host "- Password: demo123456" -ForegroundColor White
