#!/bin/bash

echo "🔧 Rebuilding React Native App with Keychain Fixes"
echo "=================================================="
echo ""

cd /Users/utkarshsundkar/Desktop/fina/Ai

# Ask which platform
echo "Which platform are you testing on?"
echo "1) iOS"
echo "2) Android"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📱 Rebuilding for iOS..."
    echo ""
    
    # Clean iOS build
    echo "Cleaning iOS build cache..."
    cd ios
    rm -rf build
    rm -rf Pods
    pod install
    cd ..
    
    # Rebuild
    echo ""
    echo "Starting iOS build..."
    npx react-native run-ios
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "🤖 Rebuilding for Android..."
    echo ""
    
    # Clean Android build
    echo "Cleaning Android build cache..."
    cd android
    ./gradlew clean
    cd ..
    
    # Rebuild
    echo ""
    echo "Starting Android build..."
    npx react-native run-android
    
else
    echo "Invalid choice. Please run again and select 1 or 2."
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ Build complete! Try the login flow again."
echo "=================================================="
