@echo off
echo 🚀 SuperKonnected Community Platform Deployment
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the application
echo 🔨 Building the application...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Check if Firebase CLI is installed
    firebase --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo 🔥 Deploying to Firebase...
        firebase deploy
    ) else (
        echo ⚠️  Firebase CLI not found. Build is ready in the 'build' folder.
        echo 💡 To deploy to Firebase, install Firebase CLI: npm install -g firebase-tools
        echo 💡 Then run: firebase deploy
    )
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 🎉 Deployment script completed!
pause
