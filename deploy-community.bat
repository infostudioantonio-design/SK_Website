@echo off
echo 🚀 Deploying SuperKonnected Community to Firebase...

REM Build de React app
echo 📦 Building React app...
call npm run build

REM Controleer of build succesvol was
if not exist "build" (
    echo ❌ Build failed! Check for errors.
    pause
    exit /b 1
)

REM Deploy naar Firebase
echo 🔥 Deploying to Firebase...
call firebase deploy --only hosting:community

echo ✅ Deployment complete!
echo 🌐 Community available at: https://community.superkonnected.nl
pause
