#!/bin/bash

# Setup Splash Screen Icon for iOS
echo "🎨 Setting up Splash Screen icon..."

IOS_ASSETS="./ios/RNSMKitUIDemoApp/Images.xcassets/SplashIcon.imageset"
LOGO="./assets/Logo.png"

# Create directory
mkdir -p "$IOS_ASSETS"

# Generate @1x, @2x, @3x images for the splash screen (e.g., base size 200px)
# We use a reasonably large size so it looks good on all screens
convert "$LOGO" -resize 200x200 "$IOS_ASSETS/splash.png"
convert "$LOGO" -resize 400x400 "$IOS_ASSETS/splash@2x.png"
convert "$LOGO" -resize 600x600 "$IOS_ASSETS/splash@3x.png"

# Create Contents.json
cat > "$IOS_ASSETS/Contents.json" << 'EOF'
{
  "images": [
    {
      "idiom": "universal",
      "filename": "splash.png",
      "scale": "1x"
    },
    {
      "idiom": "universal",
      "filename": "splash@2x.png",
      "scale": "2x"
    },
    {
      "idiom": "universal",
      "filename": "splash@3x.png",
      "scale": "3x"
    }
  ],
  "info": {
    "version": 1,
    "author": "xcode"
  }
}
EOF

echo "✅ Splash icon set created at $IOS_ASSETS"
