#!/bin/bash

# SuperKonnected Community Deployment Script
echo "🚀 Deploying SuperKonnected Community to Firebase..."

# Build de React app
echo "📦 Building React app..."
npm run build

# Controleer of build succesvol was
if [ ! -d "build" ]; then
    echo "❌ Build failed! Check for errors."
    exit 1
fi

# Deploy naar Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy --only hosting:community

echo "✅ Deployment complete!"
echo "🌐 Community available at: https://community.superkonnected.nl"
