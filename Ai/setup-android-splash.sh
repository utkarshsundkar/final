#!/bin/bash

# Setup Splash Screen Icon for Android
echo "🎨 Setting up Android Splash Screen icons..."

# Source logo
LOGO="./assets/Logo.png"
ANDROID_RES="./android/app/src/main/res"

if [ ! -f "$LOGO" ]; then
    echo "❌ Logo.png not found!"
    exit 1
fi

# Ensure directories exist
mkdir -p "$ANDROID_RES/drawable-mdpi"
mkdir -p "$ANDROID_RES/drawable-hdpi"
mkdir -p "$ANDROID_RES/drawable-xhdpi"
mkdir -p "$ANDROID_RES/drawable-xxhdpi"
mkdir -p "$ANDROID_RES/drawable-xxxhdpi"

# Generate padded splash_logo.png (to fit within Android 12 circular mask)
# We add a 40% border of matching color to center the logo safezone
convert "$LOGO" -bordercolor "#FE552B" -border 40% -resize 150x150 "$ANDROID_RES/drawable-mdpi/splash_logo.png"
convert "$LOGO" -bordercolor "#FE552B" -border 40% -resize 225x225 "$ANDROID_RES/drawable-hdpi/splash_logo.png"
convert "$LOGO" -bordercolor "#FE552B" -border 40% -resize 300x300 "$ANDROID_RES/drawable-xhdpi/splash_logo.png"
convert "$LOGO" -bordercolor "#FE552B" -border 40% -resize 450x450 "$ANDROID_RES/drawable-xxhdpi/splash_logo.png"
convert "$LOGO" -bordercolor "#FE552B" -border 40% -resize 600x600 "$ANDROID_RES/drawable-xxxhdpi/splash_logo.png"

echo "✅ Android splash icons generated with safezone padding"
