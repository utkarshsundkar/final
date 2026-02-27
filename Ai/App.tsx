import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'react-native-gesture-handler';
import Video from 'react-native-video';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingService from './src/services/OnboardingService';
import AuthService from './src/services/AuthService';
import axios from 'axios';

// Auth Screens
import LoginScreen from './src/auth/LoginScreen';
import EmailAuthScreen from './src/auth/EmailAuthScreen';
import SignupScreen from './src/auth/SignupScreen';
import { EXERCISE_MASTER_LIST } from './src/config/ExerciseConfig';

// Onboarding Screens
import GenderScreen from './src/onboarding/GenderScreen';
import AgeScreen from './src/onboarding/AgeScreen';
import HeightScreen from './src/onboarding/HeightScreen';
import WeightScreen from './src/onboarding/WeightScreen';
import GoalWeightScreen from './src/onboarding/GoalWeightScreen';
import ActivityLevelScreen from './src/onboarding/ActivityLevelScreen';
import PrimaryGoalScreen from './src/onboarding/PrimaryGoalScreen';
import ExperienceScreen from './src/onboarding/ExperienceScreen';
import TimeCommitmentScreen from './src/onboarding/TimeCommitmentScreen';
import InjuriesScreen from './src/onboarding/InjuriesScreen';
import HealthConditionsScreen from './src/onboarding/HealthConditionsScreen';
import MotivationScreen from './src/onboarding/MotivationScreen';
import PostOnboardingScreen from './src/screens/PostOnboardingScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Image,
  Dimensions,

  Alert,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  LayoutAnimation,
  TouchableWithoutFeedback,
  TextInput,
  AppState,
  LogBox,
  Animated
} from 'react-native';

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered',
]);
LogBox.ignoreAllLogs(true);

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// SMKit/Sency SDK removed
import ProgressScreen from './src/screens/ProgressScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import LeaderboardScreen from './src/screens/LeaderboardScreen';
import PremiumModal from './src/screens/PremiumModal';
import { checkIsPremium } from './src/hooks/usePremiumStatus';
import { Platform, UIManager } from 'react-native';
import { responsive } from './src/utils/responsive';
import SplashScreen from 'react-native-splash-screen';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Disable system-wide font scaling to keep UI consistent
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.allowFontScaling = false;
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.allowFontScaling = false;

const { width } = Dimensions.get('window');

// --- Top Level Data & Components ---

const WORKOUT_DETAILS_DATA: Record<string, any> = {
  'CardioCrusher': {
    id: 'CardioCrusher',
    title: 'Cardio Crusher',
    description: 'High intensity cardio to crush calories - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Burpees', detail: '10 reps x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'FatBurnHIIT': {
    id: 'FatBurnHIIT',
    title: 'Fat Burn HIIT',
    description: 'Maximum calorie burn with explosive movements - 4 sets',
    exercises: [
      { name: 'Burpees', detail: '12 reps x 4 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 4 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '45s x 4 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Jumping Jacks', detail: '60s x 4 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'AbsReloaded': {
    id: 'AbsReloaded',
    title: 'Abs Reloaded',
    description: 'Core focused routine for defined abs - 3 sets',
    exercises: [
      { name: 'Crunches', detail: '60s x 3 sets' },
      { name: 'Tuck Hold', detail: '60s x 3 sets' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets' },
      { name: 'Side Plank', detail: '60s x 3 sets' },
    ]
  },
  'power_squad': {
    id: 'power_squad',
    title: 'Power Squad',
    description: 'Focus on explosive power and leg strength.',
    exercises: [
      { name: 'Squats', detail: '20 reps' },
      { name: 'Lunges', detail: '15 reps each' },
      { name: 'Burpees', detail: '10 reps' },
    ]
  },
  'UpperBodyStrength': {
    id: 'UpperBodyStrength',
    title: 'Upper Body Strength',
    description: 'Focus on Upper Body strength - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'FullBodyBuilder': {
    id: 'FullBodyBuilder',
    title: 'Full-Body Builder',
    description: 'Complete full body workout - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Overhead Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'HIITExpress': {
    id: 'HIITExpress',
    title: 'HIIT Express',
    description: 'Quick high intensity cardio - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'SweatCircuit': {
    id: 'SweatCircuit',
    title: 'Sweat Circuit',
    description: 'Full body sweat session - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'CardioMax': {
    id: 'CardioMax',
    title: 'Cardio Max',
    description: 'Ultimate cardio challenge for experts - 5 sets',
    exercises: [
      { name: 'Burpees', detail: '15 reps x 5 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Jumping Jacks', detail: '90s x 5 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Plank butt kicks', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'CoreCrusher': {
    id: 'CoreCrusher',
    title: 'Core Crusher',
    description: 'Intense core workout.',
    exercises: [
      { name: 'Tuck Hold', detail: '30s' },
      { name: 'Oblique Crunches', detail: '30s' },
      { name: 'Side Plank Left', detail: '30s' },
      { name: 'Side Plank Right', detail: '30s' },
    ]
  },
  'MobilityFlow': {
    id: 'MobilityFlow',
    title: 'Mobility Flow',
    description: 'Smooth mobility sequence.',
    exercises: [
      { name: 'Jefferson Curl', detail: '30s' },
      { name: 'Standing Hamstring Mobility', detail: '30s' },
      { name: 'Hamstring Mobility', detail: '30s' },
      { name: 'Side Bend Left', detail: '30s' },
      { name: 'Side Bend Right', detail: '30s' },
    ]
  },
  'DynamicMobility': {
    id: 'DynamicMobility',
    title: 'Dynamic Mobility',
    description: 'Active movement for range of motion.',
    exercises: [
      { name: 'Reverse Sit to Table Top', detail: '30s' },
      { name: 'Standing Knee Raise Left', detail: '30s' },
      { name: 'Standing Knee Raise Right', detail: '30s' },
      { name: 'Side Bend Left', detail: '30s' },
      { name: 'Side Bend Right', detail: '30s' },
    ]
  },
  'PostureFix': {
    id: 'PostureFix',
    title: 'Posture Fix',
    description: 'Improve alignment and posture - 3 sets',
    exercises: [
      { name: 'Jefferson Curl', detail: '60s x 3 sets' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Overhead Squat', detail: '60s x 3 sets' },
    ]
  },
  'MobilityMax': {
    id: 'MobilityMax',
    title: 'Mobility Max',
    description: 'Complete mobility session - 3 sets',
    exercises: [
      { name: 'Jefferson Curl', detail: '60s x 3 sets' },
      { name: 'Standing Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Side Bend Left', detail: '60s x 3 sets' },
      { name: 'Side Bend Right', detail: '60s x 3 sets' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Overhead Squat', detail: '60s x 3 sets' },
    ]
  },
  'GluteBlaster': {
    id: 'GluteBlaster',
    title: 'Glute Blaster',
    description: 'Sculpt and tone your glutes.',
    exercises: [
      { name: 'Glutes Bridge', detail: '30s' },
      { name: 'Side Lunge Left', detail: '30s' },
      { name: 'Side Lunge Right', detail: '30s' },
      { name: 'Lunge', detail: '30s' },
      { name: 'Air Squat', detail: '30s' },
    ]
  },
  'SideToSideBurner': {
    id: 'SideToSideBurner',
    title: 'Side to Side Burner',
    description: 'Lateral movements for legs - 3 sets',
    exercises: [
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
    ]
  },
  'LowImpactTorch': {
    id: 'LowImpactTorch',
    title: 'Low Impact Torch',
    description: 'Burn calories without impact - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets' },
    ]
  },
  'LowerMax': {
    id: 'LowerMax',
    title: 'Lower Max',
    description: 'Complete lower body challenge - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets' },
      { name: 'Air Squat', detail: '60s x 3 sets' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets' },
    ]
  },
  'ChestProgram': {
    id: 'ChestProgram',
    title: 'Chest Program',
    description: 'Focus on proper form and chest development - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets' },
      { name: 'Shoulder Press', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
    ]
  },
  'ArmsProgram': {
    id: 'ArmsProgram',
    title: 'Arms Program',
    description: 'Increase weights gradually for arm strength - 3 sets',
    exercises: [
      { name: 'Shoulder Press', detail: '60s x 3 sets' },
      { name: 'Push-ups', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
    ]
  },
  'LegsProgram': {
    id: 'LegsProgram',
    title: 'Legs Program',
    description: 'Build strength and endurance in your legs - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'LowerBody': {
    id: 'LowerBody',
    title: 'Leg Day Special',
    description: 'The ultimate leg day blast - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'MeditationSession': {
    id: 'MeditationSession',
    title: 'Meditation Session',
    description: 'Find your inner peace and clarity - 1 session',
    exercises: [
      { name: 'Deep Breathing', detail: '5 min' },
      { name: 'Body Scan', detail: '5 min' },
      { name: 'Mindful Observation', detail: '5 min' },
    ]
  },
  'EliteYoga': {
    id: 'EliteYoga',
    title: 'Elite Yoga',
    description: 'Advanced yoga flow for flexibility and balance - 3 sets',
    exercises: [
      { name: 'Yoga - Downward Facing Dog', detail: '60s x 3 sets' },
      { name: 'Yoga - Ustrasana', detail: '60s x 3 sets' },
      { name: 'Yoga - Baddha Konasana', detail: '60s x 3 sets' },
      { name: 'Yoga - Supta Kapotasana', detail: '60s x 3 sets' },
    ]
  },
};

const WORKOUT_PROGRAMS = [
  {
    id: 'UpperBodyStrength', title: 'Upper Body Strength', desc: 'Focus on Upper Body.',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'FullBodyBuilder', title: 'Full-Body Builder', desc: 'Focus on Full Body.',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'HIITExpress', title: 'HIIT Express', desc: 'Fast paced cardio.',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'SweatCircuit', title: 'Sweat Circuit', desc: 'Circuit training.',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ChestProgram', title: 'Chest Program', desc: 'Focus on proper form...',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ArmsProgram', title: 'Arms Program', desc: 'Increase weights grad...',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'LegsProgram', title: 'Legs Program', desc: 'Build strength and...',
    time: '33 min', tag: '5 x 3 sets', category: 'Lower',
    image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CardioCrusher', title: 'Cardio Crusher', desc: 'High intensity cardio...',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CardioMax', title: 'Cardio Max', desc: 'All-in-one cardio.',
    time: '30 min', tag: '5 x 3 sets', category: 'Cardio',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'CoreCrusher', title: 'Core Crusher', desc: 'Crush your core.',
    time: '24 min', tag: '4 x 3 sets', category: 'Core',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/core-crusher-2.jpg'
  },
  {
    id: 'AbsReloaded', title: 'Abs Reloaded', desc: 'Core focused routine.',
    time: '24 min', tag: '4 x 3 sets', category: 'Core',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'MobilityFlow', title: 'Mobility Flow', desc: 'Smooth sequence.',
    time: '30 min', tag: '5 x 3 sets', category: 'Mobility',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'DynamicMobility', title: 'Dynamic Mobility', desc: 'Active range.',
    time: '30 min', tag: '5 x 3 sets', category: 'Mobility',
    image: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=400'
  },
  {
    id: 'PostureFix', title: 'Posture Fix', desc: 'Better alignment.',
    time: '2 mins', tag: '4 Exercises', category: 'Mobility',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'
  },
  {
    id: 'MobilityMax', title: 'Mobility Max', desc: 'Full mobility.',
    time: '6 mins', tag: '10 Exercises', category: 'Mobility',
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'GluteBlaster', title: 'Glute Blaster', desc: 'Sculpt your glutes.',
    time: '24 min', tag: '4 x 3 sets', category: 'Lower',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/glute-blaster.jpg'
  },
  {
    id: 'SideToSideBurner', title: 'Side to Side Burner', desc: 'Lateral leg work.',
    time: '3 mins', tag: '6 Exercises', category: 'Lower',
    image: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'LowImpactTorch', title: 'Low Impact Torch', desc: 'Low impact cardio.',
    time: '2.5 mins', tag: '5 Exercises', category: 'Lower',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'LowerMax', title: 'Lower Max', desc: 'Ultimate leg day.',
    time: '6 mins', tag: '11 Exercises', category: 'Lower',
    image: 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'EliteYoga', title: 'Elite Yoga', desc: 'Advanced yoga flow.',
    time: '12 min', tag: '4 x 3 sets', category: 'Yoga',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
  }
];

const BODY_FOCUS_DETAILS: Record<string, any> = {
  'Shoulders': {
    id: 'Shoulders',
    title: 'Boulder Shoulders',
    description: 'Build broad and strong shoulders - 3 sets',
    exercises: [
      { name: 'Shoulder Taps', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Overhead Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Chest': {
    id: 'Chest',
    title: 'Chest Chisel',
    description: 'Sculpt a powerful chest - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Plank Hold', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Thighs': {
    id: 'Thighs',
    title: 'Thunder Thighs',
    description: 'Strengthen your quads and hamstrings - 3 sets',
    exercises: [
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Ski Jumps', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Jumps', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Hips & Glutes': {
    id: 'Hips & Glutes',
    title: 'Glute Gains',
    description: 'Target the glutes and hips - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge (Left)', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Calves': {
    id: 'Calves',
    title: 'Calf Craze',
    description: 'Build powerful calves - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Arms': {
    id: 'Arms',
    title: 'Arm Arsenal',
    description: 'Pump up your biceps and triceps - 3 sets',
    exercises: [
      { name: 'Pushups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Abs': {
    id: 'Abs',
    title: 'Core Crusher',
    description: 'Strengthen your core - 3 sets',
    exercises: [
      { name: 'Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Tuck Hold', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Pushups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'PlankCore': {
    id: 'PlankCore',
    title: 'Plank & Core Stability',
    description: 'Build a rock-solid core - 3 sets',
    exercises: [
      { name: 'High Plank', detail: '60s x 3 sets' },
      { name: 'Side Plank', detail: '60s x 3 sets' },
      { name: 'Tuck Hold', detail: '60s x 3 sets' },
    ]
  },
  'Featured_UpperBody': {
    id: 'Featured_UpperBody',
    title: 'Upper Body Circuit',
    description: 'Comprehensive strength circuit - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets' },
      { name: 'Side Lunge (Left)', detail: '60s x 3 sets' },
      { name: 'Side Lunge (Right)', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
    ]
  },
  'Featured_CoreCrusher': {
    id: 'Featured_CoreCrusher',
    title: 'Core Crusher',
    description: 'Intense core session - 3 sets',
    exercises: [
      { name: 'Tuck Hold', detail: '60s x 3 sets' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets' },
      { name: 'Side Plank', detail: '60s x 3 sets' },
    ]
  },
  'Featured_HIITExpress': {
    id: 'Featured_HIITExpress',
    title: 'HIIT Express',
    description: 'High intensity cardio blast - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
      { name: 'Air Squat', detail: '60s x 3 sets' },
    ]
  },
  'Featured_MobilityFlow': {
    id: 'Featured_MobilityFlow',
    title: 'Mobility Flow',
    description: 'Improve flexibility and range of motion - 3 sets',
    exercises: [
      { name: 'Jefferson Curl', detail: '60s x 3 sets' },
      { name: 'Standing Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Side Bend Left', detail: '60s x 3 sets' },
      { name: 'Side Bend Right', detail: '60s x 3 sets' },
    ]
  },
  'Featured_GluteBlaster': {
    id: 'Featured_GluteBlaster',
    title: 'Glute Blaster',
    description: 'Sculpt and strengthen your glutes - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets' },
    ]
  },
  'Featured_PowerPlyo': {
    id: 'Featured_PowerPlyo',
    title: 'Power Plyo',
    description: 'Explosive plyometrics - 3 sets',
    exercises: [
      { name: 'Jumps', detail: '60s x 3 sets' },
      { name: 'Ski Jumps', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets' },
    ]
  }
};

const SlideButton = ({ onSlideSuccess }: { onSlideSuccess: () => void }) => {
  const [slideX, setSlideX] = React.useState(0);
  const maxSlide = width - 48 - 8 - 48; // Screen width - padding - margin - thumb

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= maxSlide) {
          setSlideX(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > maxSlide * 0.8) {
          // Success
          setSlideX(maxSlide);
          onSlideSuccess();
        } else {
          // Reset
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setSlideX(0);
        }
      },
    })
  ).current;

  return (
    <View style={styles.slideButtonContainer}>
      <Text style={styles.slideText}>Slide to Start</Text>
      <View
        style={[styles.slideThumb, { transform: [{ translateX: slideX }] }]}
        {...panResponder.panHandlers}
      >
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/chevron-right.png' }} style={{ width: 24, height: 24 }} />
      </View>
    </View>
  );
};

import BodyFocusScreen from './src/screens/BodyFocusScreen';
import { WorkoutProvider } from './src/context/WorkoutContext';
import ExerciseService from './src/services/ExerciseService';
// --- Constants ---
const WORKOUT_FILTERS = ['Strength', 'Cardio', 'Core', 'Mobility', 'Lower'];

// --- Helper Components ---
const BottomNavBar = React.memo(({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (val: string) => void }) => {
  const navItems = [
    { id: 'Home', activeIcon: 'https://img.icons8.com/ios-filled/50/1C1C1E/home.png', inactiveIcon: 'https://img.icons8.com/ios/50/8E8E93/home.png', label: 'Home' },
    { id: 'Progress', activeIcon: 'https://img.icons8.com/ios-filled/50/1C1C1E/graph.png', inactiveIcon: 'https://img.icons8.com/ios/50/8E8E93/graph.png', label: 'Progress' },
    { id: 'Profile', activeIcon: 'https://img.icons8.com/ios-filled/50/1C1C1E/user.png', inactiveIcon: 'https://img.icons8.com/ios/50/8E8E93/user.png', label: 'Profile' },
  ];

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 12,
      paddingBottom: 24,
      paddingTop: 10,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setActiveNav(item.id)}
              activeOpacity={0.7}
              style={{ alignItems: 'center', minWidth: 64, paddingHorizontal: 8, paddingVertical: 6 }}
            >
              <Image
                source={{ uri: isActive ? item.activeIcon : item.inactiveIcon }}
                style={{ width: 24, height: 24, marginBottom: 4 }}
                resizeMode="contain"
              />
              <Text style={{
                fontSize: 11,
                fontFamily: 'Lexend',
                fontWeight: isActive ? '700' : '400',
                color: isActive ? '#1C1C1E' : '#8E8E93',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const VideoWorkoutScreen = ({ navigation, route }: any) => {
  const workout = route?.params?.workout;
  const exercises = workout?.exercises?.filter((ex: any) => !ex.isHeader) || [
    { name: 'Squats', detail: '1:36', videoUrl: '' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(90);
  const currentExercise = exercises[currentIndex];
  const nextExercise = exercises[currentIndex + 1];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev > 0) return prev - 1;

        // When timer hits 0
        if (isResting) {
          setIsResting(false);
          setCurrentIndex(c => c + 1);
          return 90; // Next exercise duration
        } else if (currentIndex < exercises.length - 1) {
          setIsResting(true);
          return 20; // Rest duration
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, isResting]);

  const handleNext = () => {
    if (isResting) {
      setIsResting(false);
      setCurrentIndex(currentIndex + 1);
      setTimer(90);
    } else if (currentIndex < exercises.length - 1) {
      setIsResting(true);
      setTimer(20);
    } else {
      Alert.alert('Workout Complete!', 'You have finished all exercises.', [
        { text: 'Finish', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const handlePrev = () => {
    if (isResting) {
      setIsResting(false);
      setTimer(90);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsResting(false);
      setTimer(90);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E' }}>
      <StatusBar barStyle="light-content" />

      {/* Exercise Info Header */}
      <View style={{ position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10 }}>
        <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '700', fontFamily: 'Lexend', textTransform: 'uppercase' }}>
          {isResting ? 'REST TIME' : `Exercise ${currentIndex + 1} of ${exercises.length}`}
        </Text>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800', fontFamily: 'Lexend', marginTop: 4 }}>
          {isResting ? `Up Next: ${nextExercise?.name}` : currentExercise.name}
        </Text>
      </View>

      {/* Video Area */}
      <View style={{ flex: 6, backgroundColor: '#000', borderRadius: 40, overflow: 'hidden', marginTop: 120, marginHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
        {isResting ? (
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 107, 53, 0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 40 }}>🧘</Text>
            </View>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', fontFamily: 'Lexend' }}>Take a Breath</Text>
            <Text style={{ color: '#8E8E93', fontSize: 16, fontFamily: 'Lexend', marginTop: 8 }}>Get ready for {nextExercise?.name}</Text>
          </View>
        ) : (
          <Video
            source={currentExercise.videoUrl ? { uri: currentExercise.videoUrl } : require('./assets/videos/squats.mp4')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            repeat
            muted
            playInBackground={false}
            playWhenInactive={false}
          />
        )}
      </View>

      {/* Timer & Controls Area */}
      <View style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: 10, alignItems: 'center', justifyContent: 'center' }}>

        {/* Main Control Row: Prev, Timer, Next */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 20 }}>

          {/* Previous Button */}
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0 && !isResting}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#F2F2F7',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: (currentIndex === 0 && !isResting) ? 0.3 : 1,
              marginRight: 15
            }}
          >
            <Text style={{ fontSize: 20, color: '#1C1C1E' }}>◀</Text>
          </TouchableOpacity>

          {/* Timer Display */}
          <View style={{ backgroundColor: isResting ? '#FFF1EB' : '#F2F2F7', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25, minWidth: 160, alignItems: 'center' }}>
            <Text style={{
              fontSize: responsive.rf(55),
              fontWeight: '800',
              fontFamily: 'Lexend',
              color: isResting ? '#FF6B35' : '#1C1C1E',
              letterSpacing: 2
            }}>
              {formatTime(timer)}
            </Text>
          </View>

          {/* Next/Finish Button */}
          <TouchableOpacity
            onPress={handleNext}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: (currentIndex === exercises.length - 1 && !isResting) ? '#FF6B35' : '#F2F2F7',
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: 15,
              shadowColor: (currentIndex === exercises.length - 1 && !isResting) ? '#FF6B35' : 'transparent',
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 3
            }}
          >
            {(currentIndex === exercises.length - 1 && !isResting) ? (
              <Text style={{ fontSize: 16, color: 'white', fontWeight: '800' }}>✓</Text>
            ) : (
              <Text style={{ fontSize: 20, color: isResting ? '#FF6B35' : '#1C1C1E' }}>▶</Text>
            )}
          </TouchableOpacity>

        </View>

      </View>

      {/* Close Button */}
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Quit Workout?',
            'Your progress for this session will be lost. Are you sure you want to stop?',
            [
              { text: 'Keep Going', style: 'cancel' },
              { text: 'Yes, Quit', onPress: () => navigation.goBack(), style: 'destructive' }
            ]
          );
        }}
        style={{ position: 'absolute', top: 50, right: 25, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}
      >
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '600' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const MainTabScreen = ({ navigation }: any) => {
  // const [didConfig, setDidConfig] = useState(false); // Sency Config moved to App.tsx
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Active');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null); // Store full user if needed
  const [userRank, setUserRank] = useState<number | null>(null); // User's leaderboard rank

  useEffect(() => {
    // Initial fetch
    AuthService.getCurrentUser().then(u => {
      setUser(u);
      setIsPremium(!!(u?.isPremium || u?.isPaid));
      // Fetch user rank
      if (u?.id) {
        fetchUserRank(u.id);
      }
    });

    // Subscribe to updates
    const listener = (u: any) => {
      console.log('MainTabScreen: User updated', u);
      setUser(u);
      setIsPremium(!!(u?.isPremium || u?.isPaid));
    };

    AuthService.addChangeListener(listener);
    return () => AuthService.removeChangeListener(listener);
  }, []);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      AuthService.getCurrentUser().then(u => {
        console.log('MainTabScreen: Focus refreshed user', { isPremium: u?.isPremium });
        setUser(u);
        setIsPremium(!!(u?.isPremium || u?.isPaid));
      });
    }, [])
  );

  // Fetch user's leaderboard rank
  const fetchUserRank = async (userId: string) => {
    try {
      const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2/users';

      const response = await axios.get(`${BACKEND_URL}/leaderboard`);
      if (response.data.success) {
        const leaderboard = response.data.data.leaderboard;
        const userEntry = leaderboard.find((entry: any) => entry.userId === userId);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user rank:', error);
    }
  };

  // Challenge functions
  const findOpponent = async () => {
    try {
      // Check if user is logged in
      if (!user?.id) {
        Alert.alert('Error', 'Please log in to find opponents');
        return;
      }

      setLoadingOpponent(true);
      const token = await AuthService.getAccessToken();

      if (!token) {
        Alert.alert('Error', 'Authentication required. Please log in again.');
        setLoadingOpponent(false);
        return;
      }

      const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2';

      console.log('Finding opponent for user:', user.id);
      console.log('Using URL:', `${BACKEND_URL}/challenges/find-opponent`);

      const response = await axios.get(`${BACKEND_URL}/challenges/find-opponent`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Find opponent response:', response.data);

      if (response.data.success) {
        setMatchedOpponent(response.data.data.opponent);
        Alert.alert('Opponent Found!', `You've been matched with ${response.data.data.opponent.username}`);
      }
    } catch (error: any) {
      console.error('Failed to find opponent:', error);
      console.error('Error response:', error.response?.data);

      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else if (error.response?.status === 404) {
        Alert.alert('No Opponents', 'No opponents available at the moment. Try again later!');
      } else {
        Alert.alert('Error', 'Failed to find opponent. Please try again.');
      }
    } finally {
      setLoadingOpponent(false);
    }
  };

  const fetchChallenges = async () => {
    try {
      const token = await AuthService.getAccessToken();
      const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2';

      const response = await axios.get(`${BACKEND_URL}/challenges/my-challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const allChallenges = [...response.data.data.sent, ...response.data.data.received];
        setChallenges(allChallenges);
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const createChallenge = async (exercise: string, targetReps: number, timeLimit: number) => {
    try {
      const token = await AuthService.getAccessToken();
      const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2';

      const response = await axios.post(
        `${BACKEND_URL}/challenges/create`,
        {
          opponentId: matchedOpponent.userId,
          exercise,
          targetReps,
          timeLimit
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Challenge sent!');
        setShowChallengeModal(false);
        setMatchedOpponent(null);
        fetchChallenges(); // Refresh challenges
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
      Alert.alert('Error', 'Failed to create challenge');
    }
  };

  // Fetch nearby users (above and below in rank)
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);

  const fetchNearbyUsers = async () => {
    try {
      const BACKEND_URL = 'https://final-py2y.onrender.com/api/v2/users';

      const response = await axios.get(`${BACKEND_URL}/leaderboard`);
      if (response.data.success && user?.id) {
        const leaderboard = response.data.data.leaderboard;
        const currentUserIndex = leaderboard.findIndex((u: any) => u.userId === user.id);

        if (currentUserIndex !== -1) {
          // Get 2 users above and 2 users below
          const nearby = [];

          // Users above (higher rank = lower index)
          if (currentUserIndex > 0) {
            nearby.push(leaderboard[currentUserIndex - 1]);
          }
          if (currentUserIndex > 1) {
            nearby.unshift(leaderboard[currentUserIndex - 2]);
          }

          // Users below (lower rank = higher index)
          if (currentUserIndex < leaderboard.length - 1) {
            nearby.push(leaderboard[currentUserIndex + 1]);
          }
          if (currentUserIndex < leaderboard.length - 2) {
            nearby.push(leaderboard[currentUserIndex + 2]);
          }

          setNearbyUsers(nearby);
        }
      }
    } catch (error) {
      console.error('Failed to fetch nearby users:', error);
    }
  };

  // Fetch challenges and nearby users on mount
  useEffect(() => {
    if (user?.id) {
      fetchChallenges();
      fetchNearbyUsers();
    }
  }, [user]);


  // Challenge form states
  const [selectedChallengeExercise, setSelectedChallengeExercise] = useState('HighKnees');
  const [challengeReps, setChallengeReps] = useState('10');
  const [challengeTimeLimit, setChallengeTimeLimit] = useState('60');
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  const availableExercises = EXERCISE_MASTER_LIST.map(ex => ex.name);


  // Sency Config State (removed)

  // Summary Modal State
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('Home');
  const listOpacity = useRef(new Animated.Value(1)).current;

  const handleFilterChange = (f: string) => {
    Animated.sequence([
      Animated.timing(listOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(listOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setSelectedFilter(f);

    // Explicit scroll handling
    const scroll = filterScrollRef.current;
    if (!scroll) return;

    if (f === 'Lower') {
      // Align with the far right corner
      scroll.scrollToEnd({ animated: true });
    } else if (f === 'Strength') {
      // Align with the far left corner
      scroll.scrollTo({ x: 0, animated: true });
    } else if (f === 'Cardio') {
      // Align Cardio with the left side of the box
      if (filterOffsets.current['Cardio'] !== undefined) {
        scroll.scrollTo({ x: filterOffsets.current['Cardio'], animated: true });
      }
    }
    // For 'Core' and 'Mobility', we do absolutely nothing to the scroll position
  };
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null); // For Modal
  const [selectedFilter, setSelectedFilter] = useState('Strength'); // For Completed tab filter
  const [selectedExercise, setSelectedExercise] = useState<any>(null); // For Exercise Info Popup

  const filterScrollRef = useRef<ScrollView>(null);
  const filterOffsets = useRef<Record<string, number>>({});
  const filterWidths = useRef<Record<string, number>>({});

  // Challenge states
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingOpponent, setLoadingOpponent] = useState(false);
  const [currentWorkoutName, setCurrentWorkoutName] = useState<string | null>(null);

  const handleWorkoutCompletion = async (params: any) => {
    console.log('=== WORKOUT COMPLETION START ===');
    console.log('Raw params:', JSON.stringify(params, null, 2));
    console.log('User ID:', user?.id);
    console.log('User credits before:', user?.credits);

    let data = params?.summary;

    // If no summary in params, maybe params IS the summary or result string
    if (!data && params) {
      data = params;
    }

    // First parse - might be a string
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch (e) {
      console.log("First parse failed/not JSON");
    }

    // Second parse - Sency returns nested JSON string in summary.summary
    if (data?.summary && typeof data.summary === 'string') {
      try {
        console.log('Parsing nested summary string...');
        data = JSON.parse(data.summary);
      } catch (e) {
        console.log("Second parse failed/not JSON");
      }
    }

    console.log('Parsed data:', JSON.stringify(data, null, 2));

    // Only show if we have some data
    if (data) {
      setSummaryData(data);
      setShowSummary(true);

      // Save to Backend
      if (user?.id) {
        try {
          console.log("Saving workout results to backend...");
          const exercises = data.exercises || data.results || (Array.isArray(data) ? data : []);
          console.log('Exercises found:', exercises);
          let totalCreditsEarned = 0;

          if (Array.isArray(exercises)) {
            console.log(`Processing ${exercises.length} exercises...`);
            for (const ex of exercises) {
              // Sency SDK uses these exact field names
              const name = ex.exercise_info?.exercise_id || ex.name || ex.exercise || ex.exerciseName || "Unknown";
              const total = ex.reps_performed || ex.reps || ex.totalReps || 0;
              const perfect = ex.reps_performed_perfect || ex.perfectReps || ex.repsCorrect || ex.cleanReps || 0;

              console.log(`Exercise: ${name}, Total: ${total}, Perfect: ${perfect}`);

              if (total > 0) {
                console.log(`Calling saveExercise for ${name}...`);
                const result = await ExerciseService.saveExercise(user.id, name, total, perfect);
                console.log('Save result:', result);
                totalCreditsEarned += perfect;
              }
            }

            // Save workout completion if we have a workout name
            if (currentWorkoutName) {
              try {
                console.log(`Saving workout completion for: ${currentWorkoutName}`);
                const allPerfect = exercises.every((ex: any) => {
                  const total = ex.reps_performed || ex.reps || ex.totalReps || 0;
                  const perfect = ex.reps_performed_perfect || ex.perfectReps || ex.repsCorrect || ex.cleanReps || 0;
                  return total === perfect && total > 0;
                });
                await ExerciseService.saveWorkoutCompletion(user.id, currentWorkoutName, exercises, allPerfect);
                console.log('Workout completion saved successfully');
                setCurrentWorkoutName(null); // Reset after saving
              } catch (error) {
                console.error('Failed to save workout completion:', error);
              }
            }

            // Refresh user profile to get updated credits
            console.log(`Workout complete! ${totalCreditsEarned} credits earned.`);
            const updatedUser = await AuthService.refreshUserProfile();
            if (updatedUser) {
              setUser(updatedUser);
              console.log('Credits updated:', updatedUser.credits);
              // Refresh rank as well
              fetchUserRank(updatedUser.id);
            } else {
              console.log('Failed to refresh user profile');
            }
          } else {
            console.log('Exercises is not an array:', typeof exercises);
          }
        } catch (err: any) {
          console.error("Failed to save workout:", err);
          console.error("Error details:", err.message, err.stack);
        }
      } else {
        console.log('No user ID - user not logged in');
      }
    } else {
      console.log('No data to process');
    }
    console.log('=== WORKOUT COMPLETION END ===');
  };


  // --- Workout Logic ---

  const showDailyKickstartDetails = async () => {
    try {
      const onboardingData = await OnboardingService.getOnboardingData();
      let level = onboardingData?.experience || 'beginner';
      level = level.toLowerCase();
      const day = new Date().getDay();

      let uiExercises: any[] = [];
      let description = "";

      // Monday (Day 1)
      if (day === 1 || day === 0) {
        if (level === 'intermediate') {
          description = "Day 1 - Upper Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Shoulder Press', detail: '1 set • 15 reps', displayIndex: 1 },
            { name: 'Shoulder Taps Plank', detail: '1 set • 20 sec', displayIndex: 2 },
            { name: 'Standing Side Bend (L)', detail: '1 set • 10 reps', displayIndex: 3 },
            { name: 'Standing Side Bend (R)', detail: '1 set • 10 reps', displayIndex: 4 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Push-up', detail: '4 sets • 12-15 reps', displayIndex: 5 },
            { name: 'Shoulder Press', detail: '4 sets • 12 reps', displayIndex: 6 },
            { name: 'Shoulder Taps Plank', detail: '3 sets • 30 sec', displayIndex: 7 },
            { name: 'Side Plank (L)', detail: '3 sets • 30 sec', displayIndex: 8 },
            { name: 'Side Plank (R)', detail: '3 sets • 30 sec', displayIndex: 9 },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 1 - Upper Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Shoulder Press', detail: '1 set • 20 reps', displayIndex: 1 },
            { name: 'Shoulder Taps Plank', detail: '1 set • 30 sec', displayIndex: 2 },
            { name: 'Side Plank (L)', detail: '1 set • 20 sec', displayIndex: 3 },
            { name: 'Side Plank (R)', detail: '1 set • 20 sec', displayIndex: 4 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Push-up', detail: '5 sets • 18-20 reps', displayIndex: 5 },
            { name: 'Shoulder Press', detail: '4 sets • 15 reps', displayIndex: 6 },
            { name: 'Shoulder Taps Plank', detail: '4 sets • 40 sec', displayIndex: 7 },
            { name: 'Side Plank (L)', detail: '4 sets • 40 sec', displayIndex: 8 },
            { name: 'Side Plank (R)', detail: '4 sets • 40 sec', displayIndex: 9 },
          ];
        } else {
          // Beginner (Existing)
          description = "Day 1 - Upper Body + Core";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Shoulder Press', detail: '1 set • 12 reps', displayIndex: 1 },
            { name: 'Side Bend Left', detail: '1 set • 10 reps', displayIndex: 2 },
            { name: 'Side Bend Right', detail: '1 set • 10 reps', displayIndex: 3 },
            { name: 'Shoulder Taps', detail: '1 set • 15 sec', displayIndex: 4 },
            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Push-ups', detail: '3 sets • 8-10 reps', displayIndex: 5 },
            { name: 'Shoulder Press', detail: '3 sets • 10-12 reps', displayIndex: 6 },
            { name: 'Shoulder Taps', detail: '3 sets • 20 sec', displayIndex: 7 },
            { name: 'Side Plank', detail: '2 sets/side • 20 sec', displayIndex: 8 },
            { name: 'Side Bend Left', detail: '2 sets • 12 reps', displayIndex: 9 },
            { name: 'Side Bend Right', detail: '2 sets • 12 reps', displayIndex: 10 },
          ];
        }
      }
      // Tuesday (Day 2)
      else if (day === 2) {
        if (level === 'intermediate') {
          description = "Day 2 - Lower Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Air Squat', detail: '1 set • 15 reps', displayIndex: 1 },
            { name: 'Side Lunge (L)', detail: '1 set • 8 reps', displayIndex: 2 },
            { name: 'Side Lunge (R)', detail: '1 set • 8 reps', displayIndex: 3 },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 12 reps', displayIndex: 4 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 12 reps', displayIndex: 5 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Air Squat', detail: '4 sets • 15 reps', displayIndex: 6 },
            { name: 'Lunge', detail: '3 sets • 12 reps/leg', displayIndex: 7 },
            { name: 'Side Lunge (L)', detail: '3 sets • 10 reps', displayIndex: 8 },
            { name: 'Side Lunge (R)', detail: '3 sets • 10 reps', displayIndex: 9 },
            { name: 'Glute Bridge', detail: '3 sets • 15 reps', displayIndex: 10 },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 2 - Lower Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Air Squat', detail: '1 set • 20 reps', displayIndex: 1 },
            { name: 'Side Lunge (L)', detail: '1 set • 10 reps', displayIndex: 2 },
            { name: 'Side Lunge (R)', detail: '1 set • 10 reps', displayIndex: 3 },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 15 reps', displayIndex: 4 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 15 reps', displayIndex: 5 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Air Squat', detail: '5 sets • 20 reps', displayIndex: 6 },
            { name: 'Lunge', detail: '4 sets • 15 reps/leg', displayIndex: 7 },
            { name: 'Side Lunge (L)', detail: '3 sets • 12 reps', displayIndex: 8 },
            { name: 'Side Lunge (R)', detail: '3 sets • 12 reps', displayIndex: 9 },
            { name: 'Glute Bridge', detail: '4 sets • 20 reps', displayIndex: 10 },
          ];
        } else {
          // Beginner (Existing)
          description = "Day 2 - Lower Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Air Squat', detail: '1 set • 12 reps', displayIndex: 1 },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 10 reps', displayIndex: 2 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 10 reps', displayIndex: 3 },
            { name: 'Side Lunge (L)', detail: '1 set • 6 reps', displayIndex: 4 },
            { name: 'Side Lunge (R)', detail: '1 set • 6 reps', displayIndex: 5 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Air Squat', detail: '3 sets • 12 reps', displayIndex: 6 },
            { name: 'Lunge', detail: '3 sets • 10 reps/leg', displayIndex: 7 },
            { name: 'Side Lunge (L)', detail: '2 sets • 8 reps', displayIndex: 8 },
            { name: 'Side Lunge (R)', detail: '2 sets • 8 reps', displayIndex: 9 },
            { name: 'Glute Bridge', detail: '3 sets • 12 reps', displayIndex: 10 },
          ];
        }
      }
      // Wednesday (Day 3)
      else if (day === 3) {
        if (level === 'intermediate') {
          description = "Day 3 - Core";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Glute Bridge', detail: '2 sets • 20 reps', displayIndex: 1 },
            { name: 'Standing Oblique Crunches', detail: '2 sets • 12 reps', displayIndex: 2 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Crunches', detail: '4 sets • 20 reps', displayIndex: 4 },
            { name: 'Standing Oblique Crunches', detail: '3 sets • 20 reps', displayIndex: 5 },
            { name: 'High Plank', detail: '3 sets • 40 sec', displayIndex: 5 },
            { name: 'Side Plank', detail: '3 sets • 30 sec', displayIndex: 6 },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 3 - Core";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Standing Oblique Crunches', detail: '1 set • 40 reps', displayIndex: 1 },
            { name: 'Glute Bridge', detail: '1 set • 15 reps', displayIndex: 2 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Crunches', detail: '4 sets • 25 reps', displayIndex: 3 },
            // Removed Bicycle
            { name: 'Standing Oblique Crunches', detail: '4 sets • 25 reps', displayIndex: 4 },
            { name: 'High Plank', detail: '4 sets • 60 sec', displayIndex: 5 },
            { name: 'Glute Bridge', detail: '3 sets • 20 reps', displayIndex: 6 },
          ];
        } else {
          // Beginner
          description = "Day 3 - Core";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Glute Bridge', detail: '1 set • 20 reps', displayIndex: 1 },
            { name: 'Standing Oblique Crunches', detail: '1 set • 12 reps', displayIndex: 2 },
            { name: 'Standing Oblique Crunches', detail: '1 set • 10 reps', displayIndex: 3 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Crunches', detail: '3 sets • 15 reps', displayIndex: 4 },
            { name: 'Glute Bridge', detail: '3 sets • 20 reps', displayIndex: 5 },
            { name: 'Standing Oblique Crunches', detail: '3 sets • 15 reps', displayIndex: 6 },
            { name: 'High Plank', detail: '2 sets • 30 sec', displayIndex: 7 },
            { name: 'Standing Oblique Crunches', detail: '2 sets • 12 reps', displayIndex: 8 },
          ];
        }
      }
      // Thursday (Day 4)
      else if (day === 4) {
        if (level === 'intermediate') {
          description = "Day 4 - Conditioning";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Jumping Jacks', detail: '1 set • 40 sec', displayIndex: 1 },
            { name: 'High Knees', detail: '1 set • 40 sec', displayIndex: 2 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Jumping Jacks', detail: '4 sets • 40 sec', displayIndex: 3 },
            { name: 'High Knees', detail: '4 sets • 40 sec', displayIndex: 4 },
            { name: 'Skater Hops', detail: '3 sets • 15 reps/side', displayIndex: 5 },
            { name: 'Ski Jumps', detail: '3 sets • 10 reps', displayIndex: 6 },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 4 - Conditioning";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Jumping Jacks', detail: '1 set • 60 sec', displayIndex: 1 },
            { name: 'High Knees', detail: '1 set • 60 sec', displayIndex: 2 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Jumping Jacks', detail: '5 sets • 60 sec', displayIndex: 3 },
            { name: 'High Knees', detail: '5 sets • 60 sec', displayIndex: 4 },
            { name: 'Skater Hops', detail: '4 sets • 20 reps/side', displayIndex: 5 },
            { name: 'Air Squat', detail: '4 sets • 15 reps', displayIndex: 6 },
          ];
        } else {
          // Beginner
          description = "Day 4 - Cardio + Full Body";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Jumping Jacks', detail: '1 set • 40 sec', displayIndex: 1 },
            { name: 'Jumps', detail: '1 set • 30 sec', displayIndex: 2 },
            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'High Knees', detail: '3 sets • 30 sec', displayIndex: 3 },
            { name: 'Jumping Jacks', detail: '3 sets • 40 sec', displayIndex: 4 },
            { name: 'Jumps', detail: '3 sets • 30 sec', displayIndex: 6 },
            { name: 'Skater Hops', detail: '2 sets • 10 reps/side', displayIndex: 7 },
            { name: 'Ski Jumps', detail: '2 sets • 6 reps', displayIndex: 8 },
          ];
        }
      }
      // Friday (Day 5)
      else if (day === 5) {
        if (level === 'intermediate') {
          description = "Day 5 - Mobility";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Hamstring Mobility', detail: '1 set • 10 reps', displayIndex: 1 },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 15 reps', displayIndex: 2 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 15 reps', displayIndex: 3 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Squat', detail: '3 sets • 10 reps', displayIndex: 4 },
            { name: 'Standing Knee Raise (L)', detail: '3 sets • 15 reps', displayIndex: 5 },
            { name: 'Standing Knee Raise (R)', detail: '3 sets • 15 reps', displayIndex: 6 },
            { name: 'Hamstring Mobility', detail: '3 sets • 12 reps', displayIndex: 7 },
            { name: 'Standing Hamstring Mobility', detail: '3 sets • 30 sec', displayIndex: 8 },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 5 - Mobility";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Hamstring Mobility', detail: '1 set • 12 reps', displayIndex: 1 },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 20 reps', displayIndex: 2 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 20 reps', displayIndex: 3 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Squat', detail: '4 sets • 12 reps', displayIndex: 4 },
            { name: 'Standing Knee Raise (L)', detail: '3 sets • 20 reps', displayIndex: 5 },
            { name: 'Standing Knee Raise (R)', detail: '3 sets • 20 reps', displayIndex: 6 },
            { name: 'Hamstring Mobility', detail: '3 sets • 15 reps', displayIndex: 7 },
            { name: 'Standing Hamstring Mobility', detail: '3 sets • 40 sec', displayIndex: 8 },
          ];
        } else {
          // Beginner
          description = "Day 5 - Mobility";
          uiExercises = [
            { isHeader: true, title: '🔥 Warm-up' },
            { name: 'Standing Knee Raise (L)', detail: '1 set • 10 reps', displayIndex: 1 },
            { name: 'Standing Knee Raise (R)', detail: '1 set • 10 reps', displayIndex: 2 },
            { name: 'Hamstring Mobility', detail: '1 set • 8 reps', displayIndex: 3 },

            { isHeader: true, title: '🏆 Main Workout' },
            { name: 'Squat', detail: '3 sets • 8 reps', displayIndex: 4 },
            { name: 'Standing Knee Raise (L)', detail: '2 sets • 12 reps', displayIndex: 5 },
            { name: 'Standing Knee Raise (R)', detail: '2 sets • 12 reps', displayIndex: 6 },
            { name: 'Hamstring Mobility', detail: '2 sets • 10 reps', displayIndex: 7 },
          ];
        }
      }

      setSelectedWorkout({
        id: 'DailyKickstart',
        title: 'Morning Kickstart',
        description: description,
        time: '10 min',
        tag: `${uiExercises.length} Exercises`,
        category: 'Daily',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        exercises: uiExercises
      });

    } catch (e) {
      console.error('Error showing daily details', e);
    }
  };

  // startDailyKickstart removed (Sency SDK)

  const startChallenge = (type: string) => {
    // Open the workout detail modal directly (no Sency SDK)
    const details = WORKOUT_DETAILS_DATA[type];
    if (details) {
      setSelectedWorkout(details);
    } else {
      Alert.alert('Workout', `Starting workout: ${type}`);
    }
  };

  // Helper function to get daily workout description
  const getDailyWorkoutDescription = () => {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const experienceLevel = user?.experienceLevel || 'Beginner'; // Default to Beginner

    const workoutDescriptions: { [key: string]: { [key: number]: string } } = {
      'Beginner': {
        1: 'Upper Body + Core',
        2: 'Lower Body',
        3: 'Core',
        4: 'Cardio + Full Body',
        5: 'Mobility',
        6: 'Rest Day',
        0: 'Rest Day',
      },
      'Intermediate': {
        1: 'Upper Body',
        2: 'Lower Body',
        3: 'Core',
        4: 'Conditioning',
        5: 'Mobility',
        6: 'Rest Day',
        0: 'Rest Day',
      },
      'Expert': {
        1: 'Upper Body',
        2: 'Lower Body',
        3: 'Core',
        4: 'Conditioning',
        5: 'Mobility',
        6: 'Rest Day',
        0: 'Rest Day',
      },
    };

    return workoutDescriptions[experienceLevel]?.[dayOfWeek] || 'Quick 5-minute routine';
  };

  // --- Stats Component ---
  const DailyStatsDisplay = ({ workoutName }: { workoutName: string }) => {
    const [stats, setStats] = useState({ attempts: 0, perfect: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchStats = async () => {
        console.log(`DailyStatsDisplay: Fetching stats for ${workoutName}...`);
        try {
          const data = await ExerciseService.getWorkoutStats(workoutName);
          console.log(`DailyStatsDisplay: Stats received for ${workoutName}:`, data);
          setStats(data);
        } catch (error) {
          console.error(`DailyStatsDisplay: Error fetching stats for ${workoutName}:`, error);
        } finally {
          setLoading(false);
        }
      };

      // Fetch once on mount
      fetchStats();
    }, [workoutName]); // Add dependency

    console.log(`DailyStatsDisplay (${workoutName}): Rendering with stats:`, stats);

    if (loading || stats.attempts === 0) {
      if (stats.attempts === 0 && !loading) {
        // console.log(`DailyStatsDisplay: No attempts for ${workoutName}, hiding component`);
      }
      return null;
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 }}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6B35/running.png' }} style={{ width: 12, height: 12, tintColor: '#FF6B35', marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: '#FF6B35', fontFamily: 'Lexend', fontWeight: '600' }}>{stats.attempts} Attempts</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
          <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/4CAF50/medal.png' }} style={{ width: 12, height: 12, tintColor: '#4CAF50', marginRight: 4 }} />
          <Text style={{ fontSize: 12, color: '#4CAF50', fontFamily: 'Lexend', fontWeight: '600' }}>{stats.perfect} Perfect</Text>
        </View>
      </View>
    );
  };

  // --- UI Components ---

  const TABS = ['Active', 'Workouts'];
  const pagerRef = useRef<ScrollView>(null);
  const activeScrollRef = useRef<ScrollView>(null);
  const characterScrollRef = useRef<ScrollView>(null);
  const completedScrollRef = useRef<ScrollView>(null);

  const onMomentumScrollEnd = (e: any) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (TABS[pageIndex] && TABS[pageIndex] !== activeTab) {
      setActiveTab(TABS[pageIndex]);
    }
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    const index = TABS.indexOf(tab);
    pagerRef.current?.scrollTo({ x: index * width, animated: true });

    // Scroll the page content to top when tab is pressed
    setTimeout(() => {
      if (tab === 'Active') {
        activeScrollRef.current?.scrollTo({ y: 0, animated: true });
      } else if (tab === 'Character') {
        characterScrollRef.current?.scrollTo({ y: 0, animated: true });
      } else if (tab === 'Workouts') {
        completedScrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }, 300);
  };

  // Header removed — title is now inline in the new home screen


  // --- New Screens Imported ---

  // --- Data ---
  const CHALLENGES = [
    {
      id: 'CardioCrusher',
      title: 'Cardio Crusher',
      description: 'Morning workout with high intensity cardio.',
      category: 'Cardio',
      started: 'Aug 15, 2023',
      goal: '2 000 POINTS',
      image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80',
      bgColor: '#E3F2FD',
      action: () => startChallenge('CardioCrusher')
    },
    {
      id: 'AbsReloaded',
      title: 'Abs Reloaded',
      description: 'Core focused routine for defined abs.',
      category: 'Strength',
      started: 'Sep 10, 2023',
      goal: '1 800 POINTS',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      bgColor: '#FFFFFF',
      action: () => startChallenge('AbsReloaded')
    }
  ];

  return (
    <WorkoutProvider startWorkout={startChallenge}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <SafeAreaView style={{ flex: 1, backgroundColor: '#FF6B35' }} edges={['top', 'left', 'right']}>

            {/* Main Content Area based on Active Nav */}
            {activeNav === 'Home' ? (
              <View style={{ flex: 1, backgroundColor: '#FF6B35' }}>
                {/* ── Header sits on the colored background ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
                  <Text style={{ fontSize: responsive.rf(26), fontWeight: '800', color: '#FFFFFF', fontFamily: 'Lexend', letterSpacing: -0.5 }}>Arthlete</Text>
                </View>

                {/* ── White content card ── */}
                <ScrollView
                  style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
                  contentContainerStyle={{ paddingTop: 10, paddingBottom: 110 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* ── Featured Program Card ── */}
                  <TouchableOpacity
                    activeOpacity={0.97}
                    onPress={() => {
                      if (isPremium) showDailyKickstartDetails();
                      else setShowPremiumModal(true);
                    }}
                    style={{
                      marginHorizontal: 16,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 3,
                      marginBottom: 14,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Card Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}>
                      <View style={{ flex: 1, marginRight: 16 }}>
                        <Text style={{ fontSize: 13, color: '#6B6B6B', fontFamily: 'Lexend', marginBottom: 8 }}>
                          Day {new Date().getDay() || 7} of 28
                        </Text>
                        <Text style={{
                          fontSize: responsive.rf(26),
                          fontWeight: '800',
                          color: '#1C1C1E',
                          fontFamily: 'Lexend',
                          lineHeight: 30,
                          textTransform: 'uppercase',
                          letterSpacing: -0.5,
                        }}>
                          {getDailyWorkoutDescription()} Program
                        </Text>
                      </View>
                      {/* Icon */}
                      <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: '#FFF0E6',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 32 }}>💪</Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 20 }} />

                    {/* Session rows */}
                    {[
                      { name: 'Morning Kickstart', duration: '10 min' },
                      { name: getDailyWorkoutDescription(), duration: '20 min' },
                    ].map((session, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (isPremium) {
                            if (session.name === 'Morning Kickstart') {
                              navigation.navigate('VideoWorkout', {
                                workout: {
                                  title: 'Morning Kickstart',
                                  exercises: [{ name: 'Morning Warmup', detail: '10 min' }]
                                }
                              });
                            } else {
                              showDailyKickstartDetails();
                            }
                          } else {
                            setShowPremiumModal(true);
                          }
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 20,
                          paddingVertical: 14,
                          borderBottomWidth: idx === 0 ? 1 : 0,
                          borderBottomColor: '#F2F2F7',
                        }}
                      >
                        <Text style={{ fontSize: 16, color: '#1C1C1E', fontFamily: 'Lexend', fontWeight: '500' }}>
                          {session.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ fontSize: 14, color: '#8E8E93', fontFamily: 'Lexend' }}>{session.duration}</Text>
                          <Text style={{ fontSize: 14, color: '#FF6B35', fontFamily: 'Lexend' }}>▶</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </TouchableOpacity>

                  {/* ── Today's Meditation Card ── */}
                  <TouchableOpacity
                    activeOpacity={0.97}
                    onPress={() => {
                      if (isPremium) {
                        const details = WORKOUT_DETAILS_DATA['MeditationSession'];
                        if (details) setSelectedWorkout(details);
                      } else {
                        setShowPremiumModal(true);
                      }
                    }}
                    style={{
                      marginHorizontal: 16,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 18,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.06,
                      shadowRadius: 8,
                      elevation: 3,
                      marginBottom: 24,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: '#4A90E2', fontFamily: 'Lexend', fontWeight: '600', marginBottom: 6 }}>
                        TODAY'S MINDFULNESS
                      </Text>
                      <Text style={{ fontSize: 17, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend', marginBottom: 4 }}>
                        Meditation Session
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B6B6B', fontFamily: 'Lexend' }}>
                        Relax and Recharge · 15 min
                      </Text>
                    </View>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#4A90E2' }}>🧘</Text>
                    </View>
                  </TouchableOpacity>

                  {/* ── Latest Programs ── */}
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#1C1C1E',
                    fontFamily: 'Lexend',
                    paddingHorizontal: 16,
                    marginBottom: 14,
                  }}>
                    Challenges
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                    style={{ marginBottom: 28 }}
                  >
                    {[
                      { id: 'CardioCrusher', title: 'Cardio Crusher', tag: 'New · 6 sessions', author: 'Coach Sarah', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=400&q=80', emoji: '🏃' },
                      { id: 'FatBurnHIIT', title: 'Fat Burn HIIT', tag: 'HIIT · 4 sessions', author: 'Coach Sarah', img: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=400&q=80', emoji: '🔥' },
                      { id: 'Shoulders', title: 'Shoulder Builder', tag: 'Strength · 6 sessions', author: 'Coach Alex', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80', emoji: '💪' },
                      { id: 'LowerBody', title: 'Leg Day Special', tag: 'Lower · 5 sessions', author: 'Coach Laura', img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=80', emoji: '🦵' },
                    ].map((item, idx) => (
                      <View
                        key={idx}
                        style={{
                          width: 200,
                          marginVertical: 4, // Space for shadow to breathe
                          backgroundColor: '#FFFFFF',
                          borderRadius: 18,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          elevation: 4,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.93}
                          onPress={() => {
                            if (!isPremium) { setShowPremiumModal(true); return; }
                            const details = WORKOUT_DETAILS_DATA[item.id];
                            if (details) setSelectedWorkout(details);
                            else startChallenge(item.id);
                          }}
                          style={{ flex: 1, borderRadius: 18, overflow: 'hidden' }}
                        >
                          <View style={{ height: 120, backgroundColor: '#f0f0f0' }}>
                            <Image
                              source={{ uri: item.img }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          </View>
                          <View style={{ padding: 14 }}>
                            <Text style={{ fontSize: 12, color: '#FF6B35', fontFamily: 'Lexend', fontWeight: '600', marginBottom: 4 }}>
                              {item.tag}
                            </Text>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend', marginBottom: 2 }}>
                              {item.title}
                            </Text>
                            <Text style={{ fontSize: 13, color: '#8E8E93', fontFamily: 'Lexend' }}>
                              {item.author}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>

                  {/* ── Motivational Quote ── */}
                  <View style={{ marginHorizontal: 16, marginBottom: 40, backgroundColor: '#F8F9FA', padding: 16, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#FF6B35' }}>
                    <Text style={{ fontSize: 14, color: '#1C1C1E', fontFamily: 'Lexend', lineHeight: 20, fontStyle: 'italic' }}>
                      “The only bad workout is the one that didn't happen. Every step forward is a victory.”
                    </Text>
                  </View>
                </ScrollView>
              </View>
            ) : activeNav === 'Workout' ? (
              <View style={{ flex: 1, backgroundColor: '#FF6B35' }}>
                {/* ── Header sits on the colored background ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
                  <Text style={{ fontSize: responsive.rf(26), fontWeight: '800', color: '#FFFFFF', fontFamily: 'Lexend', letterSpacing: -0.5 }}>Workouts</Text>
                </View>

                {/* ── White content card ── */}
                <ScrollView
                  style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
                  contentContainerStyle={{ paddingTop: 10, paddingBottom: 110 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Filter row */}
                  <ScrollView
                    ref={filterScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 2 }} // Removed paddingRight to allow solid right alignment for Lower
                    style={{ marginHorizontal: 16, marginBottom: 0 }}
                  >
                    {WORKOUT_FILTERS.map((f, i) => (
                      <TouchableOpacity
                        key={f}
                        onLayout={(e) => {
                          filterOffsets.current[f] = e.nativeEvent.layout.x;
                          filterWidths.current[f] = e.nativeEvent.layout.width;
                        }}
                        onPress={() => handleFilterChange(f)}
                        style={{
                          paddingHorizontal: 22,
                          paddingVertical: 12,
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                          backgroundColor: selectedFilter === f ? '#1C1C1E' : '#F2F2F7',
                          zIndex: 2,
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontFamily: 'Lexend',
                          fontWeight: '700',
                          color: selectedFilter === f ? '#FFFFFF' : '#8E8E93'
                        }}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Unified Workout Section */}
                  <Animated.View style={{
                    flex: 1,
                    backgroundColor: '#1C1C1E',
                    marginHorizontal: 16,
                    marginTop: 0,
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 28,
                    borderTopRightRadius: 0,
                    borderTopLeftRadius: 0,
                    paddingTop: 24,
                    paddingBottom: 20,
                    opacity: listOpacity
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: '#FFFFFF',
                      fontFamily: 'Lexend',
                      paddingHorizontal: 20,
                      marginBottom: 18,
                      opacity: 0.9
                    }}>
                      {selectedFilter} Programs
                    </Text>

                    <View style={{ paddingHorizontal: 16 }}>
                      {[
                        { id: 'HIITExpress', title: 'HIIT Express', subtitle: 'Quick high intensity cardio', duration: '18 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', category: 'Cardio' },
                        { id: 'SweatCircuit', title: 'Sweat Circuit', subtitle: 'Full body sweat session', duration: '20 min', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', category: 'Cardio' },
                        { id: 'CardioCrusher', title: 'Cardio Crusher', subtitle: 'High intensity cardio blast', duration: '30 min', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&q=80', category: 'Cardio' },
                        { id: 'CardioMax', title: 'Cardio Max', subtitle: 'Ultimate cardio challenge', duration: '35 min', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80', category: 'Cardio' },
                        { id: 'UpperBodyStrength', title: 'Upper Body Strength', subtitle: 'Focus on upper body development', duration: '18 min', image: 'https://images.unsplash.com/photo-1581009146145-b5ef03a726ec?w=400&q=80', category: 'Strength' },
                        { id: 'FullBodyBuilder', title: 'Full Body Builder', subtitle: 'Complete body conditioning', duration: '18 min', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', category: 'Strength' },
                        { id: 'ChestProgram', title: 'Chest Program', subtitle: 'Chisel and define your chest', duration: '18 min', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', category: 'Strength' },
                        { id: 'ArmsProgram', title: 'Arms Program', subtitle: 'Bicep and tricep focused', duration: '18 min', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2ec617?w=400&q=80', category: 'Strength' },
                        { id: 'AbsReloaded', title: 'Abs Reloaded', subtitle: 'Core focused for defined abs', duration: '20 min', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80', category: 'Core' },
                        { id: 'CoreCrusher', title: 'Core Crusher', subtitle: 'Deep abdominal conditioning', duration: '18 min', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80', category: 'Core' },
                        { id: 'MobilityFlow', title: 'Mobility Flow', subtitle: 'Flexibility & recovery', duration: '22 min', image: 'https://images.unsplash.com/photo-1552196564-977a44d0b6ca?w=400&q=80', category: 'Mobility' },
                        { id: 'DynamicMobility', title: 'Dynamic Mobility', subtitle: 'Active range of motion', duration: '15 min', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&q=80', category: 'Mobility' },
                        { id: 'PostureFix', title: 'Posture Fix', subtitle: 'Align and strengthen', duration: '12 min', image: 'https://images.unsplash.com/photo-1544111767-4e6f47098e94?w=400&q=80', category: 'Mobility' },
                        { id: 'MobilityMax', title: 'Mobility Max', subtitle: 'Full body movement scope', duration: '25 min', image: 'https://images.unsplash.com/photo-1591258382457-d6a99ceaf5f6?w=400&q=80', category: 'Mobility' },
                        { id: 'LowerBody', title: 'Leg Day Special', subtitle: 'Complete lower body workout', duration: '35 min', image: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&q=80', category: 'Lower' },
                        { id: 'LegsProgram', title: 'Legs Program', subtitle: 'Powerful leg development', duration: '25 min', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80', category: 'Lower' },
                        { id: 'GluteBlaster', title: 'Glute Blaster', subtitle: 'Targeted glute activation', duration: '20 min', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80', category: 'Lower' },
                        { id: 'SideToSideBurner', title: 'Side to side Burner', subtitle: 'Lateral movement focus', duration: '18 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80', category: 'Lower' },
                        { id: 'LowImpactTorch', title: 'Low impact Torch', subtitle: 'Easy on joints, high burn', duration: '22 min', image: 'https://images.unsplash.com/photo-1434754239191-30de97523eb1?w=400&q=80', category: 'Lower' },
                        { id: 'LowerMax', title: 'Lower Max', subtitle: 'Ultimate lower body power', duration: '30 min', image: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400&q=80', category: 'Lower' },
                      ].filter(item => item.category === selectedFilter).map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.85}
                          onPress={() => {
                            if (!isPremium) { setShowPremiumModal(true); return; }
                            const details = WORKOUT_DETAILS_DATA[item.id];
                            if (details) setSelectedWorkout(details);
                            else startChallenge(item.id);
                          }}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', marginRight: 14 }}>
                            <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Lexend', marginBottom: 3 }}>{item.title}</Text>
                            <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Lexend' }}>{item.subtitle}</Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'Lexend', marginBottom: 4 }}>{item.duration}</Text>
                            <Text style={{ fontSize: 16, color: '#FFFFFF' }}>▶</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Animated.View>

                  {/* Body Parts Section */}
                  <View style={{ marginBottom: 32, marginTop: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend', paddingHorizontal: 16, marginBottom: 14 }}>
                      Body Parts
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                      {[
                        { name: 'Arms', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/biceps.png', color: '#F2F2F7' },
                        { name: 'Chest', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/chest.png', color: '#F2F2F7' },
                        { name: 'Back', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/back-muscles.png', color: '#F2F2F7' },
                        { name: 'Shoulders', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/shoulders.png', color: '#F2F2F7' },
                        { name: 'Legs', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/leg.png', color: '#F2F2F7' },
                        { name: 'Abs', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/torso.png', color: '#F2F2F7' },
                        { name: 'Thighs', image: 'https://img.icons8.com/ios-filled/100/1C1C1E/hamstrings.png', color: '#F2F2F7' },
                      ].map((part, idx) => (
                        <TouchableOpacity
                          key={idx}
                          activeOpacity={0.8}
                          onPress={() => {
                            if (!isPremium) { setShowPremiumModal(true); return; }
                          }}
                          style={{
                            width: 100,
                            height: 110,
                            backgroundColor: part.color,
                            borderRadius: 20,
                            padding: 12,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 }}>
                            <Image source={{ uri: part.image }} style={{ width: 26, height: 26, tintColor: '#1C1C1E' }} resizeMode="contain" />
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: '#1C1C1E', fontFamily: 'Lexend' }}>{part.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Custom Workout Option */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      if (!isPremium) { setShowPremiumModal(true); return; }
                      // Action for custom workout builder
                    }}
                    style={{
                      marginHorizontal: 16,
                      marginBottom: 50,
                      backgroundColor: '#FF7A00', // Vibrant Orange
                      borderRadius: 24,
                      padding: 24,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      shadowColor: '#FF7A00',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.3,
                      shadowRadius: 15,
                      elevation: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF', fontFamily: 'Lexend', marginBottom: 6 }}>Custom Workout</Text>
                      <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'Lexend' }}>Build your own personalized training plan</Text>
                    </View>
                    <View style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        fontSize: 32,
                        color: '#FFFFFF',
                        fontWeight: '300',
                        marginTop: -4, // Adjustment to visually center the '+' symbol
                        includeFontPadding: false
                      }}>+</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ) : activeNav === 'Progress' ? (
              <View style={{ flex: 1, backgroundColor: '#FF6B35' }}>
                {/* ── Header sits on the colored background ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
                  <Text style={{ fontSize: responsive.rf(26), fontWeight: '800', color: '#FFFFFF', fontFamily: 'Lexend', letterSpacing: -0.5 }}>Progress</Text>
                </View>
                {/* ── White content card ── */}
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
                  <ProgressScreen />
                </View>
              </View>
            ) : (
              <View style={{ flex: 1, backgroundColor: '#FF6B35' }}>
                {/* ── Header sits on the colored background ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}>
                  <Text style={{ fontSize: responsive.rf(26), fontWeight: '800', color: '#FFFFFF', fontFamily: 'Lexend', letterSpacing: -0.5 }}>Profile</Text>
                </View>
                {/* ── White content card ── */}
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
                  <ProfileScreen navigation={navigation} />
                </View>
              </View>
            )}
            <BottomNavBar activeNav={activeNav} setActiveNav={setActiveNav} />
          </SafeAreaView>

          {
            isLoading && (
              <View style={styles.loadingOverlay}>
                <Text style={{ color: 'white', fontWeight: '700', fontFamily: 'Lexend' }}>Initializing AI Engine...</Text>
              </View>
            )
          }

          {/* Summary Modal */}
          <Modal visible={showSummary} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.workoutCompleteModal}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  {/* Celebration Header */}
                  <View style={styles.celebrationHeader}>
                    <Text style={styles.celebrationEmoji}>🎉</Text>
                    <Text style={styles.workoutCompleteTitle}>Workout Complete!</Text>
                    <Text style={styles.workoutCompleteSubtitle}>Great job pushing through!</Text>
                  </View>

                  {/* 1. Credits Earned (Moved to Top) */}
                  <View style={[styles.creditsEarnedCard, { marginBottom: 20, marginTop: 0 }]}>
                    <Text style={styles.creditsEarnedLabel}>Credits Earned</Text>
                    <View style={styles.creditsEarnedValue}>
                      <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/FFD700/fire-element.png' }}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                      />
                      <Text style={styles.creditsEarnedNumber}>
                        +{summaryData?.exercises?.reduce((sum: number, ex: any) =>
                          sum + (ex.reps_performed_perfect || 0), 0) || 0}
                      </Text>
                    </View>
                  </View>

                  {/* 2. Overall Workout Stats (New) */}
                  {summaryData?.exercises && (() => {
                    const totalReps = summaryData.exercises.reduce((sum: number, ex: any) => sum + (ex.reps_performed || 0), 0);
                    const totalPerfect = summaryData.exercises.reduce((sum: number, ex: any) => sum + (ex.reps_performed_perfect || 0), 0);
                    const overallAccuracy = totalReps > 0 ? Math.round((totalPerfect / totalReps) * 100) : 0;

                    return (
                      <View style={{ backgroundColor: '#F8F9FA', borderRadius: 20, padding: 24, marginBottom: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }}>
                          {/* Total Reps */}
                          <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 32, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Lexend' }}>{totalReps}</Text>
                            <Text style={{ fontSize: 13, color: '#666', fontFamily: 'Lexend', marginTop: 4 }}>Total Reps</Text>
                          </View>

                          <View style={{ width: 1, backgroundColor: '#EEE', height: '80%' }} />

                          {/* Accuracy */}
                          <View style={{ alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 32, fontWeight: '700', color: overallAccuracy >= 80 ? '#4CAF50' : overallAccuracy >= 60 ? '#FF9800' : '#FF5252', fontFamily: 'Lexend' }}>{overallAccuracy}%</Text>
                            <Text style={{ fontSize: 13, color: '#666', fontFamily: 'Lexend', marginTop: 4 }}>Clean Reps</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}

                  {/* 3. Detailed Exercise List */}
                  {summaryData?.exercises && (
                    <View style={styles.statsContainer}>
                      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, marginLeft: 4, color: '#333', fontFamily: 'Lexend' }}>Exercise Breakdown</Text>
                      {summaryData.exercises
                        .filter((ex: any) => ex.reps_performed > 0)
                        .map((ex: any, idx: number) => {
                          const exerciseName = ex.exercise_info?.exercise_id || ex.name || 'Exercise';
                          const totalReps = ex.reps_performed || 0;
                          const perfectReps = ex.reps_performed_perfect || 0;
                          const accuracy = totalReps > 0 ? Math.round((perfectReps / totalReps) * 100) : 0;

                          return (
                            <View key={idx} style={styles.statCard}>
                              <View style={styles.statCardHeader}>
                                <Text style={styles.exerciseName}>{exerciseName}</Text>
                                <View style={[
                                  styles.accuracyBadge,
                                  { backgroundColor: accuracy >= 80 ? '#4CAF50' : accuracy >= 60 ? '#FF9800' : '#FF5252' }
                                ]}>
                                  <Text style={styles.accuracyText}>{accuracy}%</Text>
                                </View>
                              </View>
                              {/* Simplified body since we show totals at top */}
                              <View style={styles.statCardBody}>
                                <View style={styles.statItem}>
                                  <Text style={styles.statValue}>{totalReps}</Text>
                                  <Text style={styles.statLabel}>Reps</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>{perfectReps}</Text>
                                  <Text style={styles.statLabel}>Perfect</Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                    </View>
                  )}

                  {/* Done Button */}
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setShowSummary(false)}
                  >
                    <Text style={styles.doneButtonText}>Continue</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Challenge Creation Modal */}
          <Modal visible={showChallengeModal} animationType="slide" transparent={true}>
            <View style={styles.bottomModalOverlay}>
              <View style={styles.challengeModalContent}>
                {/* Drag Indicator */}
                <View style={{ width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />

                {/* Header with Gradient Background */}
                <View style={{ marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <View>
                      <Text style={{ fontSize: 28, fontWeight: '800', fontFamily: 'Lexend', color: '#1A1A1A' }}>Create Challenge</Text>
                      <Text style={{ fontSize: 14, color: '#666', marginTop: 4, fontFamily: 'Lexend' }}>Set your challenge parameters</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowChallengeModal(false)}
                      style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 20, color: '#666' }}>×</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Opponent Card */}
                  {matchedOpponent && (
                    <View style={{

                      padding: 20,
                      borderRadius: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      shadowColor: '#667eea',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                      backgroundColor: '#667eea',
                    }}>
                      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                        <Text style={{ fontSize: 28 }}>🎯</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 4, fontFamily: 'Lexend' }}>CHALLENGING</Text>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: '#FFF', fontFamily: 'Lexend' }}>{matchedOpponent.username}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
                            <Text style={{ fontSize: 12, color: '#FFF', fontFamily: 'Lexend' }}>#{matchedOpponent.rank}</Text>
                          </View>
                          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                            <Text style={{ fontSize: 12, color: '#FFF', fontFamily: 'Lexend' }}>🔥 {matchedOpponent.credits}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                  {/* Exercise Selection */}
                  <View style={{ marginBottom: 28 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'Lexend', color: '#1A1A1A' }}>Exercise</Text>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B35', marginLeft: 8 }} />
                    </View>

                    {/* Dropdown-style selector */}
                    <View style={{
                      backgroundColor: '#F8F9FA',
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: '#E8E8E8',
                      overflow: 'hidden',
                    }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                        }}
                        onPress={() => setShowExerciseDropdown(!showExerciseDropdown)}
                      >
                        <Text style={{
                          fontSize: 18,
                          fontFamily: 'Lexend',
                          fontWeight: '600',
                          color: '#1A1A1A',
                        }}>
                          {selectedChallengeExercise}
                        </Text>
                        <Text style={{ fontSize: 20, color: '#666' }}>
                          {showExerciseDropdown ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>

                      {showExerciseDropdown && (
                        <View style={{ borderTopWidth: 1, borderTopColor: '#E8E8E8' }}>
                          {availableExercises.map((exercise, index) => (
                            <TouchableOpacity
                              key={exercise}
                              style={{
                                paddingHorizontal: 20,
                                paddingVertical: 14,
                                backgroundColor: selectedChallengeExercise === exercise ? '#FFF5F0' : 'transparent',
                                borderTopWidth: index > 0 ? 1 : 0,
                                borderTopColor: '#F0F0F0',
                              }}
                              onPress={() => {
                                setSelectedChallengeExercise(exercise);
                                setShowExerciseDropdown(false);
                              }}
                            >
                              <Text style={{
                                fontSize: 16,
                                fontFamily: 'Lexend',
                                fontWeight: selectedChallengeExercise === exercise ? '700' : '500',
                                color: selectedChallengeExercise === exercise ? '#FF6B35' : '#333',
                              }}>
                                {exercise}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Target Reps */}
                  <View style={{ marginBottom: 28 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'Lexend', color: '#1A1A1A' }}>Target Reps</Text>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginLeft: 8 }} />
                    </View>
                    <View style={{
                      backgroundColor: '#F8F9FA',
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: '#E8E8E8',
                      paddingHorizontal: 20,
                      paddingVertical: 4,
                    }}>
                      <TextInput
                        style={{
                          fontSize: 18,
                          fontFamily: 'Lexend',
                          fontWeight: '600',
                          color: '#1A1A1A',
                          paddingVertical: 14,
                        }}
                        placeholder="e.g., 20"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={challengeReps}
                        onChangeText={setChallengeReps}
                      />
                    </View>
                  </View>

                  {/* Time Limit */}
                  <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'Lexend', color: '#1A1A1A' }}>Time Limit</Text>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#2196F3', marginLeft: 8 }} />
                    </View>
                    <View style={{
                      backgroundColor: '#F8F9FA',
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: '#E8E8E8',
                      paddingHorizontal: 20,
                      paddingVertical: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <TextInput
                        style={{
                          fontSize: 18,
                          fontFamily: 'Lexend',
                          fontWeight: '600',
                          color: '#1A1A1A',
                          paddingVertical: 14,
                          flex: 1,
                        }}
                        placeholder="e.g., 60"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={challengeTimeLimit}
                        onChangeText={setChallengeTimeLimit}
                      />
                      <Text style={{ fontSize: 16, color: '#666', fontFamily: 'Lexend', fontWeight: '600' }}>sec</Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Send Challenge Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FF6B35',
                    borderRadius: 20,
                    paddingVertical: 18,
                    alignItems: 'center',
                    marginTop: 20,
                    shadowColor: '#FF6B35',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  onPress={() => {
                    const reps = parseInt(challengeReps);
                    const timeLimit = parseInt(challengeTimeLimit);
                    if (reps > 0 && timeLimit > 0) {
                      createChallenge(selectedChallengeExercise, reps, timeLimit);
                    } else {
                      Alert.alert('Invalid Input', 'Please enter valid numbers for reps and time limit');
                    }
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '800', fontFamily: 'Lexend', letterSpacing: 0.5 }}>
                    🚀 Send Challenge
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


          {/* Workout Details Modal */}
          <Modal visible={!!selectedWorkout} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
              <View style={styles.detailsModalContent}>
                <View style={styles.detailDragIndicator} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailTitle}>{selectedWorkout?.title}</Text>
                    <Text style={styles.detailDesc}>{selectedWorkout?.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedWorkout(null)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#F2F2F7',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginTop: -4
                    }}
                  >
                    <Text style={{ fontSize: 18, color: '#1C1C1E', fontWeight: '600' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <View style={{ width: 4, height: 20, backgroundColor: '#FF6B35', borderRadius: 2, marginRight: 10 }} />
                    <Text style={{ fontSize: responsive.rf(20), fontWeight: '800', fontFamily: 'Lexend', color: '#1C1C1E' }}>Exercises</Text>
                  </View>

                  {selectedWorkout?.exercises.map((ex: any, idx: number) => {
                    if (ex.isHeader) {
                      let iconUrl = '';
                      let cleanTitle = ex.title;
                      if (ex.title.includes('Warm-up')) {
                        iconUrl = 'https://img.icons8.com/ios-filled/50/FF6B35/fire-element.png';
                        cleanTitle = 'Warm-up';
                      } else if (ex.title.includes('Main Workout')) {
                        iconUrl = 'https://img.icons8.com/ios-filled/50/FF6B35/trophy.png';
                        cleanTitle = 'Main Workout';
                      }

                      return (
                        <View key={idx} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 24,
                          marginBottom: 16,
                          backgroundColor: '#FFF8F5',
                          paddingVertical: 10,
                          paddingHorizontal: 16,
                          borderRadius: 14,
                          alignSelf: 'flex-start'
                        }}>
                          {iconUrl ? (
                            <Image source={{ uri: iconUrl }} style={{ width: 18, height: 18, marginRight: 8, tintColor: '#FF6B35' }} resizeMode="contain" />
                          ) : null}
                          <Text style={{ fontSize: 13, fontWeight: '800', fontFamily: 'Lexend', color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {cleanTitle.replace(/🔥|🏆/g, '').trim()}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={idx}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 20,
                          padding: 18,
                          marginBottom: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: '#F2F2F7',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.03,
                          shadowRadius: 10,
                          elevation: 1
                        }}
                      >
                        <View style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          backgroundColor: '#F8F7F4',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 16,
                          borderWidth: 1,
                          borderColor: '#EFECE7'
                        }}>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FF6B35', fontFamily: 'Lexend' }}>{ex.displayIndex || idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 17, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend', marginBottom: 4 }}>{ex.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, color: '#8E8E93', fontFamily: 'Lexend', fontWeight: '500' }}>{ex.detail}</Text>
                          </View>
                        </View>
                        {ex.videoUrl && (
                          <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#E8F2FF',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Text style={{ fontSize: 14 }}>▶️</Text>
                          </View>
                        )}
                      </View>
                    )
                  })}

                  <View style={{ height: 100 }} />
                </ScrollView>

                <View style={{ position: 'absolute', bottom: 40, left: 24, right: 24 }}>
                  {['Shoulders', 'Chest', 'Thighs', 'Hips & Glutes', 'Calves', 'Arms', 'Abs', 'PlankCore', 'Featured_UpperBody', 'Featured_CoreCrusher', 'Featured_HIITExpress', 'Featured_MobilityFlow', 'Featured_GluteBlaster', 'Featured_PowerPlyo', 'CardioCrusher', 'FatBurnHIIT', 'AbsReloaded', 'UpperBodyStrength', 'FullBodyBuilder', 'HIITExpress', 'SweatCircuit', 'CardioMax', 'CoreCrusher', 'MobilityFlow', 'DynamicMobility', 'PostureFix', 'MobilityMax', 'GluteBlaster', 'SideToSideBurner', 'LowImpactTorch', 'LowerMax', 'DailyKickstart', 'ChestProgram', 'ArmsProgram', 'LegsProgram', 'MeditationSession', 'LowerBody', 'EliteYoga'].includes(selectedWorkout?.id) ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#FF6B35',
                        height: 64,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#FF6B35',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.35,
                        shadowRadius: 20,
                        elevation: 8,
                      }}
                      activeOpacity={0.85}
                      onPress={async () => {
                        const id = selectedWorkout?.id;
                        setSelectedWorkout(null);
                        setTimeout(() => {
                          // Pass the current selected workout to the video screen
                          navigation.navigate('VideoWorkout', { workout: selectedWorkout });
                        }, 600);
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: responsive.rf(20), fontWeight: '800', fontFamily: 'Lexend', letterSpacing: 0.5 }}>START WORKOUT</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{
                      backgroundColor: '#F2F2F7',
                      height: 64,
                      borderRadius: 24,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Text style={{ color: '#8E8E93', fontSize: 16, fontWeight: '700', fontFamily: 'Lexend' }}>COMING SOON</Text>
                    </View>
                  )}
                </View>

                {/* Exercise Info Overlay removed */}
              </View>
            </View>
          </Modal>

          <PremiumModal
            visible={showPremiumModal}
            onClose={() => setShowPremiumModal(false)}
            onSuccess={() => setShowPremiumModal(false)}
          />



        </View >
      </SafeAreaProvider >
    </WorkoutProvider >
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE8D6',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    maxHeight: '70%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Lexend',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'Lexend',
  },
  summaryScroll: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  summaryJson: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  // New Workout Complete Modal Styles
  workoutCompleteModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: responsive.isTablet ? 500 : '90%',
    alignSelf: 'center',
    maxHeight: '80%',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  workoutCompleteTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    fontFamily: 'Lexend',
  },
  workoutCompleteSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Lexend',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Lexend',
  },
  accuracyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accuracyText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  statCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Lexend',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Lexend',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#DDD',
  },
  creditsEarnedCard: {
    backgroundColor: '#FFF5E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  creditsEarnedLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Lexend',
  },
  creditsEarnedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditsEarnedNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Lexend',
  },
  doneButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend',
  },
  // Challenge Modal Styles
  bottomModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  challengeModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '85%',
    width: responsive.isTablet ? 600 : '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12, // Balanced padding
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  headerTitle: {
    fontSize: 18, // Reduced from 22
    fontWeight: '500',
    letterSpacing: 1.5,
    color: '#000',
    fontFamily: 'Lexend',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE8D6',
    paddingHorizontal: 10,
    paddingVertical: 4, // Slightly reduced
    borderRadius: 16,
  },
  pointsText: {
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 16, // Reduced from 18
    fontFamily: 'Lexend',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8, // Reduced spacing below tabs
    marginTop: 8,
    justifyContent: 'space-evenly',
  },
  tab: {
    // marginRight: 10, // Removed for even spacing
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  inactiveTab: {
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 17,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Lexend',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  characterTabText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  workoutsTabText: {
    color: '#000',
    fontWeight: '500',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginRight: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10, // Reduced from 30
  },
  cardContainer: {
    width: responsive.isIPad ? 380 : width * 0.85,
    marginRight: 20,
    borderRadius: 40,
    // No overflow hidden here to allow shadow, but inner content is clipped
    backgroundColor: 'white',
    padding: 12, // Create the white border effect
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardInnerContainer: {
    borderRadius: 28, // 40 - 12 = 28 approx
    overflow: 'hidden',
    backgroundColor: '#fff', // Ensure background is white
  },
  cardImageContainer: {
    height: 220, // Increased from 180 to show more image
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    padding: 24,
    paddingTop: 60, // Increased to make room for avatars inside
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  avatarRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12, // Fully inside the card
    left: 24,
    zIndex: 10,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#DDD',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    fontSize: responsive.isIPad ? 28 : 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    marginTop: 8, // Add some top margin to separate from avatars
    fontFamily: 'Lexend',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center', // Changed from flex-start to center for better alignment
  },
  label: {
    width: responsive.isIPad ? 140 : 100, // Reduced width to give more space for text
    color: '#8B7B9B',
    fontSize: responsive.isIPad ? 16 : 13,
    fontWeight: '500',
    fontFamily: 'Lexend',
  },
  value: {
    flex: 1,
    color: '#000',
    fontSize: responsive.isIPad ? 18 : 14,
    fontWeight: '400',
    lineHeight: responsive.isIPad ? 24 : 20,
    fontFamily: 'Lexend',
  },
  startedValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginRight: 6,
  },
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 10, // Increased padding
    paddingHorizontal: 10,
    borderRadius: 50, // Increased radius for larger height
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 180, // Reduced min width
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  navItemActive: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 40,
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 12, // Increased height
    alignItems: 'center',
  },
  activeIconContainer: {
    width: 36, // Increased icon container size
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navTextActive: {
    fontWeight: '600',
    color: '#000',
    fontSize: 16, // Increased font size
    fontFamily: 'Lexend',
    marginRight: 6,
  },
  navItemInactive: {
    padding: 16, // Increased touch area/spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconWhite: {
    width: 20, // Increased icon size
    height: 20,
    tintColor: 'white',
  },
  navIconGrey: {
    width: 28, // Increased inactive icon size
    height: 28,
    tintColor: '#999',
  },
  screenContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F8F7F4',
  },
  screenTitle: {
    fontSize: responsive.isIPad ? 42 : 32,
    fontWeight: '700',
    fontFamily: 'Lexend',
    marginBottom: 24,
    marginTop: 40,
    color: '#000',
    width: responsive.isIPad ? 850 : '100%',
    alignSelf: 'center',
  },
  placeholderCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Lexend',
  },
  blankScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
  },
  blankScreenText: {
    fontSize: 18,
    color: '#999',
    fontFamily: 'Lexend',
    fontWeight: '500',
  },
  dailyCard: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 40,
    padding: responsive.isIPad ? 40 : 24,
    minHeight: responsive.isIPad ? 280 : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Lexend',
    marginBottom: 4,
  },
  dailySub: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Lexend',
  },
  dailyAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF9F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Workout Details Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    padding: 24,
    width: responsive.isIPad ? 850 : '100%',
    alignSelf: 'center',
  },
  detailDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  detailTitle: {
    fontSize: responsive.rf(32),
    fontWeight: '800',
    color: '#1C1C1E',
    fontFamily: 'Lexend',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  detailDesc: {
    fontSize: 15,
    color: '#8E8E93',
    fontFamily: 'Lexend',
    marginBottom: 0,
    lineHeight: 20,
    fontWeight: '500'
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseIndexText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Lexend',
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Lexend',
  },
  slideButtonContainer: {
    height: 56,
    backgroundColor: '#F0F0F0',
    borderRadius: 28,
    justifyContent: 'center',
    padding: 4,
    marginTop: 20,
    marginBottom: 20,
    position: 'relative',
  },
  slideText: {
    alignSelf: 'center',
    color: '#888',
    fontSize: responsive.rf(16),
    fontWeight: '600',
    fontFamily: 'Lexend',
    zIndex: 1,
  },
  slideThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 4,
    zIndex: 2,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 20,
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: responsive.rf(18),
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
});

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In - Minimal config to fix 12500
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      webClientId: '442086232032-8bbp723qk05eopbhlpd58b6stg34lmdo.apps.googleusercontent.com',
      iosClientId: '442086232032-9ipualn6jg4ge97djel2gus4ddqsvdjq.apps.googleusercontent.com',
    });

    // Configure Sency SDK (Early Init) - SDK REMOVED
    /*
    const configureSDK = async () => {
      try {
        var res = await configure("public_live_8EW3iHq4zHjQLOOHqh");
        console.log("Sency SDK Configured Globally:", res);
      } catch (e: any) {
        console.error("Sency SDK Configuration Failed:", e);
      }
    };
    configureSDK();
    */

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        AuthService.refreshUserProfile();
      }
    });

    checkAuthAndOnboarding();

    return () => {
      subscription.remove();
    };
  }, []);

  const checkAuthAndOnboarding = async () => {
    try {
      // 1. Check if user is authenticated
      const isAuthenticated = await AuthService.isAuthenticated();

      if (!isAuthenticated) {
        // Not logged in - show Login screen
        setInitialRoute('Login');
      } else {
        // 2. User is authenticated, check onboarding status
        const user = await AuthService.getCurrentUser();

        // Use property from user or check via service helper
        const onboardingCompleted = user?.onboardingCompleted === true;

        if (!onboardingCompleted) {
          // Authenticated but needs onboarding
          setInitialRoute('OnboardingGender');
        } else {
          // Fully set up - go to Home
          setInitialRoute('Home');
        }
      }
    } catch (e) {
      console.error('Auth/Onboarding check error:', e);
      // Fail safe - go to Login
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
      SplashScreen.hide();
    }
  };

  if (isLoading) {
    return null; // Or a Splash Screen component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute!} screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Onboarding Screens */}
        <Stack.Screen name="OnboardingGender" component={GenderScreen} />
        <Stack.Screen name="OnboardingAge" component={AgeScreen} />
        <Stack.Screen name="OnboardingHeight" component={HeightScreen} />
        <Stack.Screen name="OnboardingWeight" component={WeightScreen} />
        <Stack.Screen name="OnboardingGoalWeight" component={GoalWeightScreen} />
        <Stack.Screen name="OnboardingActivityLevel" component={ActivityLevelScreen} />
        <Stack.Screen name="OnboardingPrimaryGoal" component={PrimaryGoalScreen} />
        <Stack.Screen name="OnboardingExperience" component={ExperienceScreen} />
        <Stack.Screen name="OnboardingTimeCommitment" component={TimeCommitmentScreen} />
        <Stack.Screen name="OnboardingInjuries" component={InjuriesScreen} />
        <Stack.Screen name="OnboardingHealthConditions" component={HealthConditionsScreen} />
        <Stack.Screen name="OnboardingMotivation" component={MotivationScreen} />

        {/* Post-Onboarding Premium Flow */}
        <Stack.Screen
          name="PostOnboarding"
          component={PostOnboardingScreen}
          options={{ headerShown: false }}
        />

        {/* Main App */}
        <Stack.Screen name="Home" component={MainTabScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="BodyFocus" component={BodyFocusScreen} />
        <Stack.Screen name="VideoWorkout" component={VideoWorkoutScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;