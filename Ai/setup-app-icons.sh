#!/bin/bash

# App Icon Setup Script for iOS and Android
# This script generates all required icon sizes from Logo.png

echo "🎨 Setting up app icons for iOS and Android..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing via Homebrew..."
    brew install imagemagick
fi

# Source logo
LOGO="./assets/Logo.png"

if [ ! -f "$LOGO" ]; then
    echo "❌ Logo.png not found in assets folder!"
    exit 1
fi

echo "✅ Found Logo.png"

# ============================================
# ANDROID ICONS
# ============================================
echo ""
echo "📱 Generating Android icons..."

# Android mipmap directories
ANDROID_RES="./android/app/src/main/res"

# Generate Android launcher icons
convert "$LOGO" -resize 48x48 "$ANDROID_RES/mipmap-mdpi/ic_launcher.png"
convert "$LOGO" -resize 72x72 "$ANDROID_RES/mipmap-hdpi/ic_launcher.png"
convert "$LOGO" -resize 96x96 "$ANDROID_RES/mipmap-xhdpi/ic_launcher.png"
convert "$LOGO" -resize 144x144 "$ANDROID_RES/mipmap-xxhdpi/ic_launcher.png"
convert "$LOGO" -resize 192x192 "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher.png"

# Generate round icons (same sizes)
convert "$LOGO" -resize 48x48 "$ANDROID_RES/mipmap-mdpi/ic_launcher_round.png"
convert "$LOGO" -resize 72x72 "$ANDROID_RES/mipmap-hdpi/ic_launcher_round.png"
convert "$LOGO" -resize 96x96 "$ANDROID_RES/mipmap-xhdpi/ic_launcher_round.png"
convert "$LOGO" -resize 144x144 "$ANDROID_RES/mipmap-xxhdpi/ic_launcher_round.png"
convert "$LOGO" -resize 192x192 "$ANDROID_RES/mipmap-xxxhdpi/ic_launcher_round.png"

echo "✅ Android icons generated in all densities"

# ============================================
# iOS ICONS
# ============================================
echo ""
echo "🍎 Generating iOS icons..."

IOS_ASSETS="./ios/RNSMKitUIDemoApp/Images.xcassets/AppIcon.appiconset"

# Create directory if it doesn't exist
mkdir -p "$IOS_ASSETS"

# Generate iOS icons (all required sizes for iOS)
convert "$LOGO" -resize 20x20 "$IOS_ASSETS/Icon-20.png"
convert "$LOGO" -resize 40x40 "$IOS_ASSETS/Icon-20@2x.png"
convert "$LOGO" -resize 60x60 "$IOS_ASSETS/Icon-20@3x.png"
convert "$LOGO" -resize 29x29 "$IOS_ASSETS/Icon-29.png"
convert "$LOGO" -resize 58x58 "$IOS_ASSETS/Icon-29@2x.png"
convert "$LOGO" -resize 87x87 "$IOS_ASSETS/Icon-29@3x.png"
convert "$LOGO" -resize 40x40 "$IOS_ASSETS/Icon-40.png"
convert "$LOGO" -resize 80x80 "$IOS_ASSETS/Icon-40@2x.png"
convert "$LOGO" -resize 120x120 "$IOS_ASSETS/Icon-40@3x.png"
convert "$LOGO" -resize 120x120 "$IOS_ASSETS/Icon-60@2x.png"
convert "$LOGO" -resize 180x180 "$IOS_ASSETS/Icon-60@3x.png"
convert "$LOGO" -resize 76x76 "$IOS_ASSETS/Icon-76.png"
convert "$LOGO" -resize 152x152 "$IOS_ASSETS/Icon-76@2x.png"
convert "$LOGO" -resize 167x167 "$IOS_ASSETS/Icon-83.5@2x.png"
convert "$LOGO" -resize 1024x1024 "$IOS_ASSETS/Icon-1024.png"

echo "✅ iOS icons generated in all sizes"

# Create Contents.json for iOS
cat > "$IOS_ASSETS/Contents.json" << 'EOF'
{
  "images": [
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "Icon-20@2x.png",
      "scale": "2x"
    },
    {
      "size": "20x20",
      "idiom": "iphone",
      "filename": "Icon-20@3x.png",
      "scale": "3x"
    },
    {
      "size": "29x29",
      "idiom": "iphone",
      "filename": "Icon-29@2x.png",
      "scale": "2x"
    },
    {
      "size": "29x29",
      "idiom": "iphone",
      "filename": "Icon-29@3x.png",
      "scale": "3x"
    },
    {
      "size": "40x40",
      "idiom": "iphone",
      "filename": "Icon-40@2x.png",
      "scale": "2x"
    },
    {
      "size": "40x40",
      "idiom": "iphone",
      "filename": "Icon-40@3x.png",
      "scale": "3x"
    },
    {
      "size": "60x60",
      "idiom": "iphone",
      "filename": "Icon-60@2x.png",
      "scale": "2x"
    },
    {
      "size": "60x60",
      "idiom": "iphone",
      "filename": "Icon-60@3x.png",
      "scale": "3x"
    },
    {
      "size": "20x20",
      "idiom": "ipad",
      "filename": "Icon-20.png",
      "scale": "1x"
    },
    {
      "size": "20x20",
      "idiom": "ipad",
      "filename": "Icon-20@2x.png",
      "scale": "2x"
    },
    {
      "size": "29x29",
      "idiom": "ipad",
      "filename": "Icon-29.png",
      "scale": "1x"
    },
    {
      "size": "29x29",
      "idiom": "ipad",
      "filename": "Icon-29@2x.png",
      "scale": "2x"
    },
    {
      "size": "40x40",
      "idiom": "ipad",
      "filename": "Icon-40.png",
      "scale": "1x"
    },
    {
      "size": "40x40",
      "idiom": "ipad",
      "filename": "Icon-40@2x.png",
      "scale": "2x"
    },
    {
      "size": "76x76",
      "idiom": "ipad",
      "filename": "Icon-76.png",
      "scale": "1x"
    },
    {
      "size": "76x76",
      "idiom": "ipad",
      "filename": "Icon-76@2x.png",
      "scale": "2x"
    },
    {
      "size": "83.5x83.5",
      "idiom": "ipad",
      "filename": "Icon-83.5@2x.png",
      "scale": "2x"
    },
    {
      "size": "1024x1024",
      "idiom": "ios-marketing",
      "filename": "Icon-1024.png",
      "scale": "1x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
EOF

echo "✅ iOS Contents.json created"

echo ""
echo "🎉 App icons setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. For Android: Clean and rebuild the app"
echo "      cd android && ./gradlew clean && cd .."
echo "      npm run android"
echo ""
echo "   2. For iOS: Clean build folder and rebuild"
echo "      cd ios && rm -rf build && pod install && cd .."
echo "      npm run ios"
echo ""
echo "✨ Your app icons are now ready!"
