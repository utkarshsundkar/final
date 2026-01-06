# App Icon Setup Guide

## ✅ Completed Setup

Your app icons have been successfully generated and installed for both iOS and Android platforms using your `Logo.png` file.

## 📱 What Was Done

### Android Icons Generated
The following icon sizes were created in the Android resource folders:

**Location:** `android/app/src/main/res/`

- **mipmap-mdpi/** (48x48px)
  - `ic_launcher.png`
  - `ic_launcher_round.png`

- **mipmap-hdpi/** (72x72px)
  - `ic_launcher.png`
  - `ic_launcher_round.png`

- **mipmap-xhdpi/** (96x96px)
  - `ic_launcher.png`
  - `ic_launcher_round.png`

- **mipmap-xxhdpi/** (144x144px)
  - `ic_launcher.png`
  - `ic_launcher_round.png`

- **mipmap-xxxhdpi/** (192x192px)
  - `ic_launcher.png`
  - `ic_launcher_round.png`

### iOS Icons Generated
The following icon sizes were created for iOS:

**Location:** `ios/RNSMKitUIDemoApp/Images.xcassets/AppIcon.appiconset/`

- Icon-20.png (20x20)
- Icon-20@2x.png (40x40)
- Icon-20@3x.png (60x60)
- Icon-29.png (29x29)
- Icon-29@2x.png (58x58)
- Icon-29@3x.png (87x87)
- Icon-40.png (40x40)
- Icon-40@2x.png (80x80)
- Icon-40@3x.png (120x120)
- Icon-60@2x.png (120x120)
- Icon-60@3x.png (180x180)
- Icon-76.png (76x76)
- Icon-76@2x.png (152x152)
- Icon-83.5@2x.png (167x167)
- Icon-1024.png (1024x1024) - App Store icon

Plus a `Contents.json` file that maps all icons correctly.

## 🚀 Next Steps to See Your Icons

### For Android:

1. **Clean the build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. **Rebuild and run:**
   ```bash
   npm run android
   ```

3. **Verify:** Check your app drawer and home screen - you should see your new logo!

### For iOS:

1. **Clean build folder:**
   ```bash
   cd ios
   rm -rf build
   pod install
   cd ..
   ```

2. **Rebuild and run:**
   ```bash
   npm run ios
   ```

3. **Verify:** Check your home screen and app switcher - you should see your new logo!

## 🔄 Updating Icons in the Future

If you need to update your app icon:

1. Replace `assets/Logo.png` with your new logo
2. Run the setup script again:
   ```bash
   ./setup-app-icons.sh
   ```
3. Clean and rebuild both platforms as shown above

## 📝 Icon Requirements

### Best Practices for App Icons:

- **Size:** Original should be at least 1024x1024px
- **Format:** PNG with transparency (if needed)
- **Shape:** Square (will be automatically rounded on Android)
- **Content:** Avoid text if possible (hard to read at small sizes)
- **Background:** Consider how it looks on both light and dark backgrounds

### Android Specific:
- Android automatically applies rounded corners
- Both square (`ic_launcher.png`) and round (`ic_launcher_round.png`) versions are generated
- Adaptive icons are supported (can be enhanced later)

### iOS Specific:
- iOS automatically applies rounded corners
- All sizes from 20x20 to 1024x1024 are required
- The 1024x1024 version is used in the App Store

## 🛠️ Technical Details

### Script Location
`setup-app-icons.sh` - Automated script that generates all icon sizes

### Dependencies
- **ImageMagick** - Used for image resizing
- The script automatically installs it via Homebrew if not present

### Manual Verification

**Android:**
Check that icons exist in:
```
android/app/src/main/res/mipmap-*/ic_launcher*.png
```

**iOS:**
Check that icons exist in:
```
ios/RNSMKitUIDemoApp/Images.xcassets/AppIcon.appiconset/
```

## 🎨 Advanced Customization

### Android Adaptive Icons (Optional)
For more modern Android icons with foreground/background layers:
1. Create separate foreground and background images
2. Update `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
3. Reference the new layers

### iOS Alternative Icons (Optional)
iOS supports alternative app icons that users can switch between:
1. Add additional icon sets to `Images.xcassets`
2. Configure in Info.plist
3. Use `UIApplication.shared.setAlternateIconName()` to switch

## ✅ Verification Checklist

- [ ] Android icons generated in all 5 densities
- [ ] iOS icons generated in all required sizes
- [ ] Contents.json created for iOS
- [ ] Android app cleaned and rebuilt
- [ ] iOS app cleaned and rebuilt
- [ ] Icon visible on Android home screen
- [ ] Icon visible on iOS home screen
- [ ] Icon looks good at different sizes

## 🐛 Troubleshooting

### Icons not showing on Android:
1. Uninstall the app completely
2. Clean the build: `cd android && ./gradlew clean && cd ..`
3. Rebuild: `npm run android`

### Icons not showing on iOS:
1. Delete the app from simulator/device
2. Clean build folder: `cd ios && rm -rf build && cd ..`
3. Reinstall pods: `cd ios && pod install && cd ..`
4. Rebuild: `npm run ios`

### Icons look blurry:
- Ensure your source Logo.png is high resolution (at least 1024x1024)
- Regenerate icons with the script

## 📚 Resources

- [Android Icon Guidelines](https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [React Native Asset Management](https://reactnative.dev/docs/images)

---

**Generated:** December 25, 2024
**Source Logo:** `assets/Logo.png`
**Platforms:** iOS & Android
