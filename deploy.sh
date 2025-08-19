#!/bin/bash

# SuperKonnected Community Platform Deployment Script
echo "🚀 SuperKonnected Community Platform Deployment"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if Firebase CLI is installed
    if command -v firebase &> /dev/null; then
        echo "🔥 Deploying to Firebase..."
        firebase deploy
    else
        echo "⚠️  Firebase CLI not found. Build is ready in the 'build' folder."
        echo "💡 To deploy to Firebase, install Firebase CLI: npm install -g firebase-tools"
        echo "💡 Then run: firebase deploy"
    fi
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment script completed!"
