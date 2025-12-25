# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# Sency SDK
-keep class com.sency.** { *; }
-keep class com.smkituilibrary.** { *; }

# Razorpay
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# Google Sign-In
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keychain
-keep class com.oblador.keychain.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }

# Moshi - Fix for R8 errors
-dontwarn com.squareup.moshi.**
-keep class com.squareup.moshi.** { *; }
-keep interface com.squareup.moshi.** { *; }
-dontwarn com.google.devtools.ksp.processing.**
-dontwarn org.jetbrains.kotlin.ksp.**

# Annotation Processing (compile-time only, safe to ignore)
-dontwarn javax.annotation.processing.**
-dontwarn javax.lang.model.**
-dontwarn javax.tools.**
-dontwarn com.squareup.kotlinpoet.**
-dontwarn shadow.com.google.auto.common.**
-dontwarn shadow.com.squareup.kotlinpoet.ksp.**

# KSP Symbol Processing (compile-time only)
-dontwarn com.google.devtools.ksp.**
-dontwarn org.jetbrains.kotlin.ksp.**

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Retrofit
-dontwarn retrofit2.**
-keep class retrofit2.** { *; }

# General optimization - Reduced to avoid issues
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 3
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom views
-keepclassmembers public class * extends android.view.View {
   void set*(***);
   *** get*();
}

# Keep Parcelables
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Keep Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
