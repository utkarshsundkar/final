import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingService from './src/services/OnboardingService';
import AuthService from './src/services/AuthService';
import axios from 'axios';

// Auth Screens
import LoginScreen from './src/auth/LoginScreen';
import EmailAuthScreen from './src/auth/EmailAuthScreen';
import SignupScreen from './src/auth/SignupScreen';

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
  DeviceEventEmitter,
  Alert,
  StatusBar,
  TouchableOpacity,
  PanResponder,
  LayoutAnimation,
  TouchableWithoutFeedback,
  TextInput,
  AppState
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  configure,
  startAssessment,
  startCustomWorkout,
  setSessionLanguage,
  startWorkoutProgram,
  setEndExercisePreferences,
  setCounterPreferences,
} from '@sency/react-native-smkit-ui';
import * as SMWorkoutLibrary from '@sency/react-native-smkit-ui/src/SMWorkout';
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

const { width } = Dimensions.get('window');

// --- Top Level Data & Components ---

const WORKOUT_DETAILS_DATA: Record<string, any> = {
  'CardioCrusher': {
    id: 'CardioCrusher',
    title: 'Cardio Crusher',
    description: 'High intensity cardio to crush calories - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Jumping Jacks', detail: '60s x 3 sets' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Jumps', detail: '60s x 3 sets' },
      { name: 'Alternate Windmill Toe Touch', detail: '60s x 3 sets' },
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
      { name: 'Push-ups', detail: '60s x 3 sets' },
      { name: 'Shoulder Press', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
    ]
  },
  'FullBodyBuilder': {
    id: 'FullBodyBuilder',
    title: 'Full-Body Builder',
    description: 'Complete full body workout - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets' },
      { name: 'Push-ups', detail: '60s x 3 sets' },
      { name: 'Overhead Squat', detail: '60s x 3 sets' },
    ]
  },
  'HIITExpress': {
    id: 'HIITExpress',
    title: 'HIIT Express',
    description: 'Quick high intensity cardio - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
      { name: 'Air Squat', detail: '60s x 3 sets' },
    ]
  },
  'SweatCircuit': {
    id: 'SweatCircuit',
    title: 'Sweat Circuit',
    description: 'Full body sweat session - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets' },
      { name: 'Crunches', detail: '60s x 3 sets' },
    ]
  },
  'CardioMax': {
    id: 'CardioMax',
    title: 'Cardio Max',
    description: 'Ultimate cardio challenge.',
    exercises: [
      { name: 'High Knees', detail: '30s' },
      { name: 'Skater Hops', detail: '30s' },
      { name: 'Shoulder Taps Plank', detail: '30s' },
      { name: 'Air Squat', detail: '30s' },
      { name: 'Jumping Jacks', detail: '30s' },
      { name: 'Oblique Crunches', detail: '30s' },
      { name: 'Crunches', detail: '30s' },
      { name: 'Jumps', detail: '30s' },
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
      { name: 'Air Squat', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
    ]
  },
};

const WORKOUT_PROGRAMS = [
  {
    id: 'UpperBodyStrength', title: 'Upper Body Strength', desc: 'Focus on Upper Body.',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/upper-body-strength.jpg'
  },
  {
    id: 'FullBodyBuilder', title: 'Full-Body Builder', desc: 'Focus on Full Body.',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/full-body-builder.jpg'
  },
  {
    id: 'HIITExpress', title: 'HIIT Express', desc: 'Fast paced cardio.',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/hiit-express.jpg'
  },
  {
    id: 'SweatCircuit', title: 'Sweat Circuit', desc: 'Circuit training.',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/sweat-circuit.jpg'
  },
  {
    id: 'ChestProgram', title: 'Chest Program', desc: 'Focus on proper form...',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://cdn.corenexis.com/view/5556365168'
  },
  {
    id: 'ArmsProgram', title: 'Arms Program', desc: 'Increase weights grad...',
    time: '18 min', tag: '3 x 3 sets', category: 'Strength',
    image: 'https://cdn.corenexis.com/view/8171825168'
  },
  {
    id: 'LegsProgram', title: 'Legs Program', desc: 'Build strength and...',
    time: '33 min', tag: '5 x 3 sets', category: 'Lower',
    image: 'https://cdn.corenexis.com/view/8614713168'
  },
  {
    id: 'CardioCrusher', title: 'Cardio Crusher', desc: 'High intensity cardio...',
    time: '24 min', tag: '4 x 3 sets', category: 'Cardio',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/cardio-crusher.jpg'
  },
  {
    id: 'CardioMax', title: 'Cardio Max', desc: 'All-in-one cardio.',
    time: '30 min', tag: '5 x 3 sets', category: 'Cardio',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/cardio-max.jpg'
  },
  {
    id: 'CoreCrusher', title: 'Core Crusher', desc: 'Crush your core.',
    time: '24 min', tag: '4 x 3 sets', category: 'Core',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/core-crusher.jpg'
  },
  {
    id: 'AbsReloaded', title: 'Abs Reloaded', desc: 'Core focused routine.',
    time: '24 min', tag: '4 x 3 sets', category: 'Core',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/abs-reloaded.jpg'
  },
  {
    id: 'MobilityFlow', title: 'Mobility Flow', desc: 'Smooth sequence.',
    time: '30 min', tag: '5 x 3 sets', category: 'Mobility',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/mobility-flow-2.jpg'
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
    image: 'https://ik.imagekit.io/an85p0bgo/icons/mobility-max.jpg'
  },
  {
    id: 'GluteBlaster', title: 'Glute Blaster', desc: 'Sculpt your glutes.',
    time: '24 min', tag: '4 x 3 sets', category: 'Lower',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/glute-blaster-2.jpg'
  },
  {
    id: 'SideToSideBurner', title: 'Side to Side Burner', desc: 'Lateral leg work.',
    time: '3 mins', tag: '6 Exercises', category: 'Lower',
    image: 'https://cdn.corenexis.com/view/4725113168'
  },
  {
    id: 'LowImpactTorch', title: 'Low Impact Torch', desc: 'Low impact cardio.',
    time: '2.5 mins', tag: '5 Exercises', category: 'Lower',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/low-impact-torch.jpg'
  },
  {
    id: 'LowerMax', title: 'Lower Max', desc: 'Ultimate leg day.',
    time: '6 mins', tag: '11 Exercises', category: 'Lower',
    image: 'https://ik.imagekit.io/an85p0bgo/icons/lower-max.jpg'
  }
];

const BODY_FOCUS_DETAILS: Record<string, any> = {
  'Shoulders': {
    id: 'Shoulders',
    title: 'Boulder Shoulders',
    description: 'Build broad and strong shoulders - 3 sets',
    exercises: [
      { name: 'Shoulder Taps', detail: '60s x 3 sets' },
      { name: 'Overhead Press', detail: '60s x 3 sets' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets' },
    ]
  },
  'Chest': {
    id: 'Chest',
    title: 'Chest Chisel',
    description: 'Sculpt a powerful chest - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
      { name: 'High Plank Hold', detail: '60s x 3 sets' },
    ]
  },
  'Thighs': {
    id: 'Thighs',
    title: 'Thunder Thighs',
    description: 'Strengthen your quads and hamstrings - 3 sets',
    exercises: [
      { name: 'Lunge', detail: '60s x 3 sets' },
      { name: 'Air Squat', detail: '60s x 3 sets' },
      { name: 'Ski Jumps', detail: '60s x 3 sets' },
      { name: 'Jumps', detail: '60s x 3 sets' },
    ]
  },
  'Hips & Glutes': {
    id: 'Hips & Glutes',
    title: 'Glute Gains',
    description: 'Target the glutes and hips - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Side Lunge (Left)', detail: '60s x 3 sets' },
    ]
  },
  'Calves': {
    id: 'Calves',
    title: 'Calf Craze',
    description: 'Build powerful calves - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets' },
    ]
  },
  'Arms': {
    id: 'Arms',
    title: 'Arm Arsenal',
    description: 'Pump up your biceps and triceps - 3 sets',
    exercises: [
      { name: 'Pushups', detail: '60s x 3 sets' },
      { name: 'Shoulder Press', detail: '60s x 3 sets' },
    ]
  },
  'Abs': {
    id: 'Abs',
    title: 'Core Crusher',
    description: 'Strengthen your core - 3 sets',
    exercises: [
      { name: 'Crunches', detail: '60s x 3 sets' },
      { name: 'Tuck Hold', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
      { name: 'Pushups', detail: '60s x 3 sets' },
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

// ... (existing imports)

const MainTabScreen = ({ navigation }: any) => {
  const [didConfig, setDidConfig] = useState(false);
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
      const BACKEND_URL = 'https://final-cudk.onrender.com/api/v2/users';

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

      const BACKEND_URL = 'https://final-cudk.onrender.com/api/v2';

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
      const BACKEND_URL = 'https://final-cudk.onrender.com/api/v2';

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
      const BACKEND_URL = 'https://final-cudk.onrender.com/api/v2';

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
      const BACKEND_URL = 'https://final-cudk.onrender.com/api/v2/users';

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

  const availableExercises = [
    'HighKnees', 'JumpingJacks', 'Squats', 'Pushups', 'Lunges',
    'Burpees', 'MountainClimbers', 'Plank', 'Situps', 'Jumps'
  ];


  // Sency Config State
  const [week, setWeek] = useState('1');
  const [bodyZone, setBodyZone] = useState(SMWorkoutLibrary.BodyZone.FullBody);
  const [difficulty, setDifficulty] = useState(SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty);
  const [duration, setDuration] = useState(SMWorkoutLibrary.WorkoutDuration.Long);
  const [language, setLanguage] = useState(SMWorkoutLibrary.Language.English);
  const [name, setName] = useState('YOUR_PROGRAM_ID');

  // Summary Modal State
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [activeNav, setActiveNav] = useState('Home');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null); // For Modal
  const [selectedFilter, setSelectedFilter] = useState('Strength'); // For Completed tab filter
  const [selectedExercise, setSelectedExercise] = useState<any>(null); // For Exercise Info Popup

  // Challenge states
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingOpponent, setLoadingOpponent] = useState(false);

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

  useEffect(() => {
    configureSMKitUI();
  }, []);

  useEffect(() => {
    console.log('Setting up Sency event listeners. User:', user?.id);

    const didExitWorkoutSubscription = DeviceEventEmitter.addListener('didExitWorkout', handleWorkoutCompletion);
    const workoutDidFinishSubscription = DeviceEventEmitter.addListener('workoutDidFinish', handleWorkoutCompletion);

    return () => {
      didExitWorkoutSubscription.remove();
      workoutDidFinishSubscription.remove();
    };
  }, [user]); // Re-subscribe when user changes

  async function configureSMKitUI() {
    setIsLoading(true);
    try {
      var res = await configure("public_live_ENl0bawcspDkVlGFaB");
      console.log("Configuration successful:", res);
      setIsLoading(false);
      setDidConfig(true);
    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Configure Failed', e.message);
    }
  }

  // SDK UI Customization & Phone Calibration Configuration
  const getModifications = () => {
    return JSON.stringify({
      primaryColor: 'orange', // Match app theme color (#FF6B35)
      phoneCalibration: {
        enabled: false, // Disable phone calibration screen by default
        autoCalibrate: false,
        calibrationSensitivity: 0.8,
      },
      showProgressBar: true,
      showCounters: true,
    });
  };

  // --- Test Function to Send Demo Data (REMOVED) ---
  /*
  const sendDemoExerciseData = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    try {
      console.log('Sending demo exercise data...');

      // Demo workout data simulating a completed HIIT session
      const demoExercises = [
        { name: 'High Knees', reps: 30, perfect: 28 },
        { name: 'Jumping Jacks', reps: 25, perfect: 25 },
        { name: 'Burpees', reps: 15, perfect: 12 },
        { name: 'Mountain Climbers', reps: 40, perfect: 35 },
        { name: 'Squats', reps: 20, perfect: 18 }
      ];

      let totalCredits = 0;
      for (const ex of demoExercises) {
        await ExerciseService.saveExercise(
          user.id,
          ex.name,
          ex.reps,
          ex.perfect,
          false
        );
        totalCredits += ex.perfect;
        console.log(`✓ Saved: ${ex.name} - ${ex.perfect}/${ex.reps} reps`);
      }

      // Refresh user to get updated credits
      const updatedUser = await AuthService.refreshUserProfile();
      if (updatedUser) setUser(updatedUser);

      Alert.alert(
        'Success!',
        `Demo workout saved!\n\n${totalCredits} credits earned!\nTotal: ${updatedUser?.credits || 0} credits`
      );
    } catch (error: any) {
      console.error('Failed to send demo data:', error);
      Alert.alert('Error', `Failed to save demo data: ${error.message}`);
    }
  };
  */

  // --- Sency Logic for Starting Workouts ---

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

  const startDailyKickstart = async () => {
    try {
      const onboardingData = await OnboardingService.getOnboardingData();
      let level = onboardingData?.experience || 'beginner';
      level = level.toLowerCase();
      const day = new Date().getDay();

      console.log(`Starting Daily Kickstart. Level: ${level}, Day: ${day}`);

      let exercises: any[] = [];

      const add = (name: string, secs: number, id: string, sets: number, isRestLast: boolean = true) => {
        for (let i = 0; i < sets; i++) {
          exercises.push(new SMWorkoutLibrary.SMExercise(name, secs, id, null, [SMWorkoutLibrary.UIElement.Timer], id, '', null));
          if (isRestLast || i < sets - 1) {
            exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          }
        }
      };

      // Monday (Day 1)
      if (day === 1 || day === 0) {
        if (level === 'intermediate') {
          // Warm-up
          add('Shoulder Press', 35, 'ShouldersPress', 1);
          add('Shoulder Taps Plank', 20, 'PlankHighShoulderTaps', 1);
          add('Standing Side Bend (L)', 30, 'PlankSideLowStatic', 1);
          add('Standing Side Bend (R)', 30, 'PlankSideLowStatic', 1);

          // Main
          add('Push-up', 45, 'PushupRegular', 4);
          add('Shoulder Press', 45, 'ShouldersPress', 4);
          add('Shoulder Taps Plank', 30, 'PlankHighShoulderTaps', 3);

          // Side Plank (3 sets/side)
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank (L)', 30, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideL', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank (R)', 30, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideR', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank (L)', 30, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideL', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank (R)', 30, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideR', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        } else if (level === 'advanced' || level === 'expert') {
          // Warm-up
          add('Shoulder Press', 35, 'ShouldersPress', 1);
          add('Shoulder Taps Plank', 30, 'PlankHighShoulderTaps', 1);
          add('Side Plank (L)', 20, 'PlankSideLowStatic', 1);
          add('Side Plank (R)', 20, 'PlankSideLowStatic', 1);

          // Main
          add('Push-up', 50, 'PushupRegular', 5);
          add('Shoulder Press', 45, 'ShouldersPress', 4);
          add('Shoulder Taps Plank', 40, 'PlankHighShoulderTaps', 4);

          add('Side Plank (L)', 40, 'PlankSideLowStatic', 4);
          add('Side Plank (R)', 40, 'PlankSideLowStatic', 4, false);
        } else {
          // Warm-up (1 set each, Rest after each)
          add('Shoulder Press (Warmup)', 30, 'ShouldersPress', 1);
          add('Side Bend Left', 30, 'PlankSideLowStatic', 1);
          add('Side Bend Right', 30, 'PlankSideLowStatic', 1);
          add('Shoulder Taps', 15, 'PlankHighShoulderTaps', 1);

          // Main
          add('Push-ups', 45, 'PushupRegular', 3);
          add('Shoulder Press', 45, 'ShouldersPress', 3);
          add('Shoulder Taps', 20, 'PlankHighShoulderTaps', 3);

          // Side Plank: 2 sets/side. Interleaved L/R/L/R logic
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank Left', 20, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideL', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank Right', 20, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideR', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));

          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank Left', 20, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideL', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Side Plank Right', 20, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideR', '', null));
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));

          add('Side Bend Left', 30, 'PlankSideLowStatic', 2);
          add('Side Bend Right', 30, 'PlankSideLowStatic', 2, false);
        }
      }
      // Tuesday (Day 2)
      else if (day === 2) {
        if (level === 'intermediate') {
          // Warm-up
          add('Air Squat', 35, 'SquatRegular', 1);
          add('Side Lunge (L)', 30, 'LungeSideLeft', 1);
          add('Side Lunge (R)', 30, 'LungeSideRight', 1);
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);

          // Main
          add('Air Squat', 40, 'SquatRegular', 4);
          add('Lunge', 35, 'LungeFrontRight', 3);
          add('Side Lunge (L)', 35, 'LungeSideLeft', 3);
          add('Side Lunge (R)', 35, 'LungeSideRight', 3, false);
          // Glute Bridge separate
          exercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
          add('Glute Bridge', 40, 'GlutesBridge', 3, false);
        } else if (level === 'advanced' || level === 'expert') {
          // Warm-up
          add('Air Squat', 40, 'SquatRegular', 1);
          add('Side Lunge (L)', 30, 'LungeSideLeft', 1);
          add('Side Lunge (R)', 30, 'LungeSideRight', 1);
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);

          // Main
          add('Air Squat', 50, 'SquatRegular', 5);
          add('Lunge', 45, 'LungeFrontRight', 4);
          add('Side Lunge (L)', 40, 'LungeSideLeft', 3);
          add('Side Lunge (R)', 40, 'LungeSideRight', 3);
          add('Glute Bridge', 45, 'GlutesBridge', 4, false);
        } else {
          // Beginner
          // Warm-up
          add('Air Squat', 35, 'SquatRegular', 1);
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);
          add('Side Lunge (L)', 30, 'LungeSideLeft', 1);
          add('Side Lunge (R)', 30, 'LungeSideRight', 1);

          // Main
          add('Air Squat', 45, 'SquatRegular', 3);
          add('Lunge', 45, 'LungeFrontRight', 3);
          add('Side Lunge (L)', 35, 'LungeSideLeft', 2);
          add('Side Lunge (R)', 35, 'LungeSideRight', 2);
          add('Glute Bridge', 40, 'GlutesBridge', 3, false);
        }
      }
      // Wednesday (Day 3)
      else if (day === 3) {
        if (level === 'intermediate') {
          // Warm-up (2 sets)
          add('Glute Bridge', 35, 'GlutesBridge', 2);
          add('Standing Oblique Crunches', 30, 'StandingObliqueCrunches', 2);

          // Main
          add('Crunches', 45, 'Crunches', 4);
          add('Standing Oblique Crunches', 40, 'StandingObliqueCrunches', 3);
          add('High Plank', 40, 'PlankHighStatic', 3);
          add('Side Plank', 35, 'PlankSideLowStatic', 3, false);
        } else if (level === 'advanced' || level === 'expert') {
          // Warm-up
          add('Standing Oblique Crunches', 40, 'StandingObliqueCrunches', 1);
          add('Glute Bridge', 40, 'GlutesBridge', 1);

          // Main
          add('Crunches', 50, 'Crunches', 4);
          // removed Bicycle
          add('Standing Oblique Crunches', 50, 'StandingObliqueCrunches', 4);
          add('High Plank', 60, 'PlankHighStatic', 4);
          add('Glute Bridge', 45, 'GlutesBridge', 3, false);
        } else {
          // Beginner
          // Warm-up
          add('Glute Bridge', 35, 'GlutesBridge', 1);
          add('Standing Oblique Crunches', 30, 'StandingObliqueCrunches', 1);
          add('Standing Oblique Crunches', 30, 'StandingObliqueCrunches', 1);

          // Main
          add('Crunches', 35, 'Crunches', 3);
          add('Glute Bridge', 40, 'GlutesBridge', 3);
          add('Standing Oblique Crunches', 35, 'StandingObliqueCrunches', 3);
          add('High Plank', 30, 'PlankHighStatic', 2);
          add('Standing Oblique Crunches', 35, 'StandingObliqueCrunches', 2, false);
        }
      }
      // Friday (Day 5)
      else if (day === 5) {
        if (level === 'intermediate') {
          // Warm-up
          add('Hamstring Mobility', 30, 'HamstringMobility', 1);
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);

          // Main
          add('Squat', 35, 'SquatRegular', 3);
          add('Standing Knee Raise (L)', 35, 'StandingKneeRaiseLeft', 3);
          add('Standing Knee Raise (R)', 35, 'StandingKneeRaiseRight', 3);
          add('Hamstring Mobility', 35, 'HamstringMobility', 3);
          add('Standing Hamstring Mobility', 35, 'StandingHamstringMobility', 3, false);
        } else if (level === 'advanced' || level === 'expert') {
          // Warm-up
          add('Hamstring Mobility', 30, 'HamstringMobility', 1);
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);

          // Main
          add('Squat', 40, 'SquatRegular', 4);
          add('Standing Knee Raise (L)', 40, 'StandingKneeRaiseLeft', 3);
          add('Standing Knee Raise (R)', 40, 'StandingKneeRaiseRight', 3);
          add('Hamstring Mobility', 40, 'HamstringMobility', 3);
          add('Standing Hamstring Mobility', 40, 'StandingHamstringMobility', 3, false);
        } else {
          // Beginner
          // Warm-up
          add('Standing Knee Raise (L)', 30, 'StandingKneeRaiseLeft', 1);
          add('Standing Knee Raise (R)', 30, 'StandingKneeRaiseRight', 1);
          add('Hamstring Mobility', 30, 'HamstringMobility', 1);

          // Main
          add('Squat', 35, 'SquatRegular', 3);
          add('Standing Knee Raise (L)', 35, 'StandingKneeRaiseLeft', 2);
          add('Standing Knee Raise (R)', 35, 'StandingKneeRaiseRight', 2);
          add('Hamstring Mobility', 35, 'HamstringMobility', 2, false);
        }
      }
      // Thursday (Day 4)
      else if (day === 4) {
        if (level === 'intermediate') {
          // Warm-up
          add('Jumping Jacks', 40, 'JumpingJacks', 1);
          add('High Knees', 40, 'HighKnees', 1);

          // Main
          add('Jumping Jacks', 40, 'JumpingJacks', 4);
          add('High Knees', 40, 'HighKnees', 4);
          add('Skater Hops', 40, 'SkaterHops', 3);
          add('Ski Jumps', 30, 'SkiJumps', 3, false);
        } else if (level === 'advanced' || level === 'expert') {
          // Warm-up
          add('Jumping Jacks', 60, 'JumpingJacks', 1);
          add('High Knees', 60, 'HighKnees', 1);

          // Main
          add('Jumping Jacks', 60, 'JumpingJacks', 5);
          add('High Knees', 60, 'HighKnees', 5);
          add('Skater Hops', 50, 'SkaterHops', 4);
          add('Air Squat', 40, 'SquatRegular', 4, false);
        } else {
          // Beginner
          // Warm-up
          add('Jumping Jacks', 40, 'JumpingJacks', 1);
          add('Jumps', 30, 'Jumps', 1);

          // Main
          add('High Knees', 30, 'HighKnees', 3);
          add('Jumping Jacks', 40, 'JumpingJacks', 3);
          add('Jumps', 30, 'Jumps', 3);
          add('Skater Hops', 30, 'SkaterHops', 2);
          add('Ski Jumps', 25, 'SkiJumps', 2, false);
        }
      }

      const workout = new SMWorkoutLibrary.SMWorkout(
        'DailyKickstart', 'Morning Kickstart', 'Day 1 - Upper Body + Core',
        SMWorkoutLibrary.BodyZone.FullBody, exercises,
        SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
      );
      const result = await startCustomWorkout(workout, getModifications());
      if (result) {
        handleWorkoutCompletion({ summary: result });
      }

    } catch (error) {
      console.error('Error starting daily kickstart:', error);
      Alert.alert('Error', 'Failed to start daily workout');
    }
  };

  const startChallenge = async (type: string) => {
    try {
      console.log('startChallenge called with type:', type);

      // Get user's fitness level from onboarding to set dynamic threshold
      const onboardingData = await OnboardingService.getOnboardingData();
      const fitnessLevel = onboardingData?.currentFitnessLevel || 'Beginner';

      // Calculate threshold based on fitness level
      const getThreshold = (level: string): number => {
        switch (level) {
          case 'Beginner':
            return 0.25; // Very lenient for beginners
          case 'Intermediate':
            return 0.5; // Moderate for intermediate
          case 'Advanced':
            return 0.8; // Stricter for advanced
          default:
            return 0.3; // Default fallback
        }
      };

      const threshold = getThreshold(fitnessLevel);
      console.log(`Using threshold ${threshold} for fitness level: ${fitnessLevel}`);

      // Set default preferences for these challenges
      setSessionLanguage(SMWorkoutLibrary.Language.English);
      setEndExercisePreferences(SMWorkoutLibrary.EndExercisePreferences.TargetBased);
      setCounterPreferences(SMWorkoutLibrary.CounterPreferences.Default);

      if (type === 'belly_league') { // Maps to "Custom Fitness" logic
        const customExercises = [
          new SMWorkoutLibrary.SMAssessmentExercise(
            'High Plank', 35, 'PlankHighStatic', null,
            [SMWorkoutLibrary.UIElement.Timer], 'PlankHighStatic', '',
            null,
            '', 'High Plank', 'Hold the position', 'Time', 'seconds'
          ),
          new SMWorkoutLibrary.SMAssessmentExercise(
            'Air Squat', 35, 'SquatRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer, SMWorkoutLibrary.UIElement.GaugeOfMotion], 'SquatRegular', '',
            null,
            '', 'Air Squat', 'Complete the exercise', 'Reps', 'clean reps'
          ),
          new SMWorkoutLibrary.SMAssessmentExercise(
            'Push-ups', 35, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null,
            '', 'Push-ups', 'Complete the exercise', 'Reps', 'clean reps'
          )
        ];

        const customAssessment = new SMWorkoutLibrary.SMWorkout(
          'belly_league', 'Belly League Workout', 'Custom Assessment Routine', SMWorkoutLibrary.BodyZone.FullBody, customExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
        );

        const result = await startCustomWorkout(customAssessment, getModifications());
        if (result) {
          handleWorkoutCompletion({ summary: result });
        }

      } else if (type === 'Shoulders') {
        console.log('Shoulders workout block reached');
        const shouldersExercises = [];

        for (let set = 1; set <= 3; set++) {
          shouldersExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `Shoulder Taps - Set ${set}`, 60, 'PlankHighShoulderTaps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Overhead Press - Set ${set}`, 60, 'ShouldersPress', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Reverse Sit to Table Top - Set ${set}`, 60, 'ReverseSitToTableTop', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ReverseSitToTableTop', '',
              null
            )
          );
          if (set < 3) {
            shouldersExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const shouldersWorkout = new SMWorkoutLibrary.SMWorkout(
          'Shoulders', 'Boulder Shoulders', 'Build broad and strong shoulders',
          SMWorkoutLibrary.BodyZone.FullBody, shouldersExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(shouldersWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }

      } else if (type === 'Chest') {
        console.log('Chest workout block reached');
        const chestExercises = [];

        for (let set = 1; set <= 3; set++) {
          chestExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `Push-ups - Set ${set}`, 60, 'PushupRegular', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Shoulder Taps Plank - Set ${set}`, 60, 'PlankHighShoulderTaps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `High Plank Hold - Set ${set}`, 60, 'PlankHighStatic', null,
              [SMWorkoutLibrary.UIElement.Timer], 'PlankHighStatic', '',
              null
            )
          );
          if (set < 3) {
            chestExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const chestWorkout = new SMWorkoutLibrary.SMWorkout(
          'Chest', 'Chest Chisel', 'Sculpt a powerful chest',
          SMWorkoutLibrary.BodyZone.FullBody, chestExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(chestWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }

      } else if (type === 'Thighs') {
        const thighsExercises = [];
        for (let set = 1; set <= 3; set++) {
          thighsExercises.push(
            new SMWorkoutLibrary.SMExercise(`Lunge - Set ${set}`, 60, 'LungeFrontRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Air Squat - Set ${set}`, 60, 'SquatRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Ski Jumps - Set ${set}`, 60, 'SkiJumps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkiJumps', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Jumps - Set ${set}`, 60, 'Jumps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Jumps', '', null)
          );
          if (set < 3) thighsExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const thighsWorkout = new SMWorkoutLibrary.SMWorkout('Thighs', 'Thunder Thighs', 'Strengthen your quads and hamstrings', SMWorkoutLibrary.BodyZone.FullBody, thighsExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(thighsWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }

      } else if (type === 'Hips & Glutes') {
        const hipsExercises = [];
        for (let set = 1; set <= 3; set++) {
          hipsExercises.push(
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Skater Hops - Set ${set}`, 60, 'SkaterHops', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge (Left) - Set ${set}`, 60, 'LungeSideLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeSideLeft', '', null)
          );
          if (set < 3) hipsExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const hipsWorkout = new SMWorkoutLibrary.SMWorkout('Hips & Glutes', 'Glute Gains', 'Target the glutes and hips', SMWorkoutLibrary.BodyZone.FullBody, hipsExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(hipsWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }

      } else if (type === 'Calves') {
        const calvesExercises = [];
        for (let set = 1; set <= 3; set++) {
          calvesExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jumping Jacks - Set ${set}`, 60, 'JumpingJacks', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'JumpingJacks', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`High Knees - Set ${set}`, 60, 'HighKnees', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null)
          );
          if (set < 3) calvesExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const calvesWorkout = new SMWorkoutLibrary.SMWorkout('Calves', 'Calf Craze', 'Build powerful calves', SMWorkoutLibrary.BodyZone.LowerBody, calvesExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(calvesWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Arms') {
        const armsExercises = [];
        for (let set = 1; set <= 3; set++) {
          armsExercises.push(
            new SMWorkoutLibrary.SMExercise(`Pushups - Set ${set}`, 60, 'PushupRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Shoulder Press - Set ${set}`, 60, 'ShouldersPress', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '', null)
          );
          if (set < 3) armsExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const armsWorkout = new SMWorkoutLibrary.SMWorkout('Arms', 'Arm Arsenal', 'Pump up your biceps and triceps', SMWorkoutLibrary.BodyZone.UpperBody, armsExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(armsWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Abs') {
        const absExercises = [];
        for (let set = 1; set <= 3; set++) {
          absExercises.push(
            new SMWorkoutLibrary.SMExercise(`Crunches - Set ${set}`, 60, 'Crunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Crunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Tuck Hold - Set ${set}`, 60, 'TuckHold', null, [SMWorkoutLibrary.UIElement.Timer], 'TuckHold', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Shoulder Taps Plank - Set ${set}`, 60, 'PlankHighShoulderTaps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Pushups - Set ${set}`, 60, 'PushupRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '', null)
          );
          if (set < 3) absExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const absWorkout = new SMWorkoutLibrary.SMWorkout('Abs', 'Core Crusher', 'Strengthen your core', SMWorkoutLibrary.BodyZone.FullBody, absExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(absWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'PlankCore') {
        const plankExercises = [];
        for (let set = 1; set <= 3; set++) {
          plankExercises.push(
            new SMWorkoutLibrary.SMExercise(`High Plank - Set ${set}`, 60, 'PlankHighStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankHighStatic', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Plank - Set ${set}`, 60, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideLowStatic', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Tuck Hold - Set ${set}`, 60, 'TuckHold', null, [SMWorkoutLibrary.UIElement.Timer], 'TuckHold', '', null)
          );
          if (set < 3) plankExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const plankWorkout = new SMWorkoutLibrary.SMWorkout('PlankCore', 'Plank & Core Stability', 'Build a rock-solid core', SMWorkoutLibrary.BodyZone.FullBody, plankExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(plankWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_UpperBody') {
        const featuredExercises = [];
        for (let set = 1; set <= 3; set++) {
          featuredExercises.push(
            new SMWorkoutLibrary.SMExercise(`Air Squat - Set ${set}`, 60, 'SquatRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge (Left) - Set ${set}`, 60, 'LungeSideLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeSideLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge (Right) - Set ${set}`, 60, 'LungeSideRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeSideRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Lunge - Set ${set}`, 60, 'LungeFrontRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null)
          );
          if (set < 3) featuredExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const featuredWorkout = new SMWorkoutLibrary.SMWorkout('Featured_UpperBody', 'Upper Body Circuit', 'Comprehensive strength circuit', SMWorkoutLibrary.BodyZone.FullBody, featuredExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(featuredWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_CoreCrusher') {
        const coreCrusherExercises = [];
        for (let set = 1; set <= 3; set++) {
          coreCrusherExercises.push(
            new SMWorkoutLibrary.SMExercise(`Tuck Hold - Set ${set}`, 60, 'TuckHold', null, [SMWorkoutLibrary.UIElement.Timer], 'TuckHold', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Oblique Crunches - Set ${set}`, 60, 'StandingObliqueCrunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingObliqueCrunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Plank - Set ${set}`, 60, 'PlankSideLowStatic', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSideLowStatic', '', null)
          );
          if (set < 3) coreCrusherExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const coreCrusherWorkout = new SMWorkoutLibrary.SMWorkout('Featured_CoreCrusher', 'Core Crusher', 'Intense core session', SMWorkoutLibrary.BodyZone.FullBody, coreCrusherExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(coreCrusherWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_HIITExpress') {
        const hiitExercises = [];
        for (let set = 1; set <= 3; set++) {
          hiitExercises.push(
            new SMWorkoutLibrary.SMExercise(`High Knees - Set ${set}`, 60, 'HighKnees', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Skater Hops - Set ${set}`, 60, 'SkaterHops', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Shoulder Taps Plank - Set ${set}`, 60, 'PlankHighShoulderTaps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Air Squat - Set ${set}`, 60, 'SquatRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '', null)
          );
          if (set < 3) hiitExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const hiitWorkout = new SMWorkoutLibrary.SMWorkout('Featured_HIITExpress', 'HIIT Express', 'High Intensity Cardio', SMWorkoutLibrary.BodyZone.FullBody, hiitExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(hiitWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_MobilityFlow') {
        const mobilityExercises = [];
        for (let set = 1; set <= 3; set++) {
          mobilityExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jefferson Curl - Set ${set}`, 60, 'JeffersonCurl', null, [SMWorkoutLibrary.UIElement.Timer], 'JeffersonCurl', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Hamstring Mobility - Set ${set}`, 60, 'StandingHamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'StandingHamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Hamstring Mobility - Set ${set}`, 60, 'HamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'HamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Left - Set ${set}`, 60, 'StandingSideBendLeft', null, [SMWorkoutLibrary.UIElement.Timer], 'StandingSideBendLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Right - Set ${set}`, 60, 'StandingSideBendRight', null, [SMWorkoutLibrary.UIElement.Timer], 'StandingSideBendRight', '', null)
          );
          if (set < 3) mobilityExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const mobilityWorkout = new SMWorkoutLibrary.SMWorkout('Featured_MobilityFlow', 'Mobility Flow', 'Flexibility and Range of Motion', SMWorkoutLibrary.BodyZone.FullBody, mobilityExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(mobilityWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_GluteBlaster') {
        const gluteExercises = [];
        for (let set = 1; set <= 3; set++) {
          gluteExercises.push(
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Left - Set ${set}`, 60, 'LungeSideLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeSideLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Right - Set ${set}`, 60, 'LungeSideRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeSideRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Lunge - Set ${set}`, 60, 'LungeFrontRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '', null)
          );
          if (set < 3) gluteExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const gluteWorkout = new SMWorkoutLibrary.SMWorkout('Featured_GluteBlaster', 'Glute Blaster', 'Sculpt Glutes and Legs', SMWorkoutLibrary.BodyZone.FullBody, gluteExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(gluteWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'Featured_PowerPlyo') {
        const plyoExercises = [];
        for (let set = 1; set <= 3; set++) {
          plyoExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jumps - Set ${set}`, 60, 'Jumps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Jumps', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Ski Jumps - Set ${set}`, 60, 'SkiJumps', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkiJumps', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`High Knees - Set ${set}`, 60, 'HighKnees', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null)
          );
          if (set < 3) plyoExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const plyoWorkout = new SMWorkoutLibrary.SMWorkout('Featured_PowerPlyo', 'Power Plyo', 'Explosive Plyometrics', SMWorkoutLibrary.BodyZone.FullBody, plyoExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(plyoWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'CardioCrusher') {
        console.log('CardioCrusher workout block reached');
        // Cardio Crusher Workout
        const cardioExercises = [
          new SMWorkoutLibrary.SMExercise(
            'High Knees', 35, 'HighKnees', null,
            [SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null

          ),
          new SMWorkoutLibrary.SMExercise(
            'Jumping Jacks', 35, 'JumpingJacks', null,
            [SMWorkoutLibrary.UIElement.Timer], 'JumpingJacks', '', null

          ),
          new SMWorkoutLibrary.SMExercise(
            'Skater Hops', 35, 'SkaterHops', null,
            [SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '', null

          ),
          new SMWorkoutLibrary.SMExercise(
            'Jumps', 35, 'Jumps', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Jumps', '', null

          ),
          new SMWorkoutLibrary.SMExercise(
            'Alternate Windmill Toe Touch', 35, 'AlternateWindmillToeTouch', null,
            [SMWorkoutLibrary.UIElement.Timer], 'AlternateWindmillToeTouch', '', null
          )
        ];

        const cardioWorkout = new SMWorkoutLibrary.SMWorkout(
          'CardioCrusher', 'Cardio Crusher', 'High intensity cardio',
          SMWorkoutLibrary.BodyZone.FullBody, cardioExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
        );

        console.log('About to call startCustomWorkout with workout:', cardioWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }
          const result = await startCustomWorkout(cardioWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'AbsReloaded') {
        console.log('AbsReloaded workout block reached');
        // Abs Reloaded Workout
        const absExercises = [
          new SMWorkoutLibrary.SMExercise(
            'Crunches', 35, 'Crunches', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Crunches', '', null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Tuck Hold', 35, 'TuckHold', null,
            [SMWorkoutLibrary.UIElement.Timer], 'TuckHold', '', null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Oblique Crunches', 35, 'StandingObliqueCrunches', null,
            [SMWorkoutLibrary.UIElement.Timer], 'StandingObliqueCrunches', '', null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Side Plank', 35, 'PlankSideLowStatic', null,
            [SMWorkoutLibrary.UIElement.Timer], 'PlankSideLowStatic', '', null
          )
        ];

        const absWorkout = new SMWorkoutLibrary.SMWorkout(
          'AbsReloaded', 'Abs Reloaded', 'Core focused routine',
          SMWorkoutLibrary.BodyZone.FullBody, absExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
        );

        console.log('About to call startCustomWorkout with workout:', absWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }
          const result = await startCustomWorkout(absWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (BODY_FOCUS_DETAILS[type]) {
        // Dynamic construction for Body Focus Areas
        const details = BODY_FOCUS_DETAILS[type];

        // Convert plain object exercises to SMAssessmentExercises matching Belly League pattern
        const sencyExercises = details.exercises.map((ex: any) => {
          // Determine UI elements based on type
          let uiElements = [SMWorkoutLibrary.UIElement.Timer];
          if (ex.type === 'reps') {
            uiElements.push(SMWorkoutLibrary.UIElement.RepsCounter);
          }

          // Create SMAssessmentExercise matching the exact pattern from Belly League
          return new SMWorkoutLibrary.SMAssessmentExercise(
            ex.name,
            35, // Match Belly League duration
            ex.sdk,
            null,
            uiElements,
            ex.sdk,
            '',
            null,
            '', // instructions
            ex.name, // displayName
            'Complete the exercise', // summaryTitle
            ex.type === 'reps' ? 'Reps' : 'Time', // uiType
            ex.type === 'reps' ? 'clean reps' : 'seconds' // uiUnit
          );
        });

        const focusWorkout = new SMWorkoutLibrary.SMWorkout(
          details.id,
          details.title,
          details.description,
          SMWorkoutLibrary.BodyZone.FullBody,
          sencyExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, // Match Belly League difficulty
          SMWorkoutLibrary.WorkoutDuration.Short,
          null
        );

        const result = await startCustomWorkout(focusWorkout, getModifications());
        if (result) {
          handleWorkoutCompletion({ summary: result });
        }

      } else if (type === 'fit_ninjas') { // Maps to Strength Logic (Pushups/Planks/Overhead Squat)
        const strengthExercises = [
          new SMWorkoutLibrary.SMExercise(
            "Pushups", 35, "PushupRegular", null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer],
            "PushupRegular", "", null
          ),
          new SMWorkoutLibrary.SMExercise(
            "Plank", 35, "PlankHighStatic", null,
            [SMWorkoutLibrary.UIElement.Timer],
            "PlankHighStatic", "", null
          )
        ];
        // Note: startCustomWorkout usually takes an SMWorkout object, not array of exercises directly.
        // Wrapping it in SMWorkout
        const ninjaWorkout = new SMWorkoutLibrary.SMWorkout(
          'fit_ninjas', 'Fit Ninjas', 'High Intensity Routine', SMWorkoutLibrary.BodyZone.FullBody, strengthExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
        );

        const result = await startCustomWorkout(ninjaWorkout, getModifications());
        if (result) {
          handleWorkoutCompletion({ summary: result });
        }
      } else if (type === 'ChestProgram') {
        console.log('ChestProgram workout block reached');
        // Chest Program Workout - 3 sets with rest
        const chestExercises = [];

        // Set 1
        chestExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 1', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 1', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 1', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 2
        chestExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 2', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 2', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 2', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 3
        chestExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 3', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 3', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 3', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          )
        );

        const chestWorkout = new SMWorkoutLibrary.SMWorkout(
          'ChestProgram', 'Chest Program', 'Focus on proper form and chest development',
          SMWorkoutLibrary.BodyZone.UpperBody, chestExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        console.log('About to call startCustomWorkout with workout:', chestWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }

          const result = await startCustomWorkout(chestWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'ArmsProgram') {
        console.log('ArmsProgram workout block reached');
        // Arms Program Workout - 3 sets with rest
        const armsExercises = [];

        // Set 1
        armsExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 1', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 1', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 1', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 2
        armsExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 2', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 2', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 2', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 3
        armsExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 3', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 3', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 3', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          )
        );

        const armsWorkout = new SMWorkoutLibrary.SMWorkout(
          'ArmsProgram', 'Arms Program', 'Increase weights gradually for arm strength',
          SMWorkoutLibrary.BodyZone.UpperBody, armsExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        console.log('About to call startCustomWorkout with workout:', armsWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }

          const result = await startCustomWorkout(armsWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'LegsProgram') {
        console.log('LegsProgram workout block reached');
        // Legs Program Workout
        const legsExercises = [
          new SMWorkoutLibrary.SMExercise(
            'Air Squat', 35, 'SquatRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Lunge', 35, 'LungeFrontRight', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Glutes Bridge', 35, 'GlutesBridge', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Side Lunge Left', 35, 'SideLungeLeft', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeLeft', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Side Lunge Right', 35, 'SideLungeRight', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeRight', '',
            null
          )
        ];

        const legsWorkout = new SMWorkoutLibrary.SMWorkout(
          'LegsProgram', 'Legs Program', 'Build strength and endurance in your legs',
          SMWorkoutLibrary.BodyZone.LowerBody, legsExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Short, null
        );

        console.log('About to call startCustomWorkout with workout:', legsWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }

          const result = await startCustomWorkout(legsWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'UpperBodyStrength') {
        console.log('UpperBodyStrength workout block reached');
        // Upper Body Strength Workout - 3 sets with rest
        const upperBodyExercises = [];

        // Set 1
        upperBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 1', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 1', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 1', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 2
        upperBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 2', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 2', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 2', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 3
        upperBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 3', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Press - Set 3', 60, 'ShouldersPress', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ShouldersPress', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Shoulder Taps Plank - Set 3', 60, 'PlankHighShoulderTaps', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
            null
          )
        );

        const upperBodyWorkout = new SMWorkoutLibrary.SMWorkout(
          'UpperBodyStrength', 'Upper Body Strength', 'Focus on Upper Body strength and definition',
          SMWorkoutLibrary.BodyZone.UpperBody, upperBodyExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        console.log('About to call startCustomWorkout with workout:', upperBodyWorkout);
        try {
          try {

            console.log('Exited any previous workout session');
          } catch (e) {
            console.log('No previous workout to exit or exit failed:', e);
          }

          const result = await startCustomWorkout(upperBodyWorkout, getModifications());
          console.log('startCustomWorkout returned:', result);
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'FullBodyBuilder') {
        console.log('FullBodyBuilder workout block reached');
        const fullBodyExercises = [];

        // Set 1
        fullBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Air Squat - Set 1', 60, 'SquatRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 1', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Overhead Squat - Set 1', 60, 'SquatOverhead', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatOverhead', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 2
        fullBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Air Squat - Set 2', 60, 'SquatRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 2', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Overhead Squat - Set 2', 60, 'SquatOverhead', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatOverhead', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          )
        );

        // Set 3
        fullBodyExercises.push(
          new SMWorkoutLibrary.SMExercise(
            'Air Squat - Set 3', 60, 'SquatRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Push-ups - Set 3', 60, 'PushupRegular', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PushupRegular', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Rest', 90, 'Rest', null,
            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
            null
          ),
          new SMWorkoutLibrary.SMExercise(
            'Overhead Squat - Set 3', 60, 'SquatOverhead', null,
            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatOverhead', '',
            null
          )
        );

        const fullBodyWorkout = new SMWorkoutLibrary.SMWorkout(
          'FullBodyBuilder', 'Full-Body Builder', 'Complete full body workout',
          SMWorkoutLibrary.BodyZone.FullBody, fullBodyExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) {
          console.log('No previous workout to exit');
        }

        try {
          const result = await startCustomWorkout(fullBodyWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'HIITExpress') {
        console.log('HIITExpress workout block reached');
        const hiitExercises = [];

        for (let set = 1; set <= 3; set++) {
          hiitExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `High Knees - Set ${set}`, 60, 'HighKnees', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Skater Hops - Set ${set}`, 60, 'SkaterHops', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Shoulder Taps Plank - Set ${set}`, 60, 'PlankHighShoulderTaps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'PlankHighShoulderTaps', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Air Squat - Set ${set}`, 60, 'SquatRegular', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '',
              null
            )
          );
          if (set < 3) {
            hiitExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const hiitWorkout = new SMWorkoutLibrary.SMWorkout(
          'HIITExpress', 'HIIT Express', 'Quick high intensity cardio',
          SMWorkoutLibrary.BodyZone.FullBody, hiitExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(hiitWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'SweatCircuit') {
        console.log('SweatCircuit workout block reached');
        const sweatExercises = [];

        for (let set = 1; set <= 3; set++) {
          sweatExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `Jumping Jacks - Set ${set}`, 60, 'JumpingJacks', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'JumpingJacks', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Oblique Crunches - Set ${set}`, 60, 'ObliqueCrunches', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ObliqueCrunches', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `High Knees - Set ${set}`, 60, 'HighKnees', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Crunches - Set ${set}`, 60, 'Crunches', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Crunches', '',
              null
            )
          );
          if (set < 3) {
            sweatExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const sweatWorkout = new SMWorkoutLibrary.SMWorkout(
          'SweatCircuit', 'Sweat Circuit', 'Full body sweat session',
          SMWorkoutLibrary.BodyZone.FullBody, sweatExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(sweatWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'CardioCrusher') {
        console.log('CardioCrusher workout block reached');
        const cardioExercises = [];

        for (let set = 1; set <= 3; set++) {
          cardioExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `High Knees - Set ${set}`, 60, 'HighKnees', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Jumping Jacks - Set ${set}`, 60, 'JumpingJacks', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'JumpingJacks', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Skater Hops - Set ${set}`, 60, 'SkaterHops', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Jumps - Set ${set}`, 60, 'Jumps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Jumps', '',
              null
            )
          );
          if (set < 3) {
            cardioExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const cardioWorkout = new SMWorkoutLibrary.SMWorkout(
          'CardioCrusher', 'Cardio Crusher', 'High intensity cardio to crush calories',
          SMWorkoutLibrary.BodyZone.FullBody, cardioExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(cardioWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'CardioMax') {
        console.log('CardioMax workout block reached');
        const maxExercises = [];

        for (let set = 1; set <= 3; set++) {
          maxExercises.push(
            new SMWorkoutLibrary.SMExercise(
              `High Knees - Set ${set}`, 60, 'HighKnees', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Jumping Jacks - Set ${set}`, 60, 'JumpingJacks', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'JumpingJacks', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Skater Hops - Set ${set}`, 60, 'SkaterHops', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Jumps - Set ${set}`, 60, 'Jumps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Jumps', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              'Rest', 90, 'Rest', null,
              [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
              null
            ),
            new SMWorkoutLibrary.SMExercise(
              `Ski Jumps - Set ${set}`, 60, 'SkiJumps', null,
              [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkiJumps', '',
              null
            )
          );
          if (set < 3) {
            maxExercises.push(
              new SMWorkoutLibrary.SMExercise(
                'Rest', 90, 'Rest', null,
                [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',
                null
              )
            );
          }
        }

        const maxWorkout = new SMWorkoutLibrary.SMWorkout(
          'CardioMax', 'Cardio Max', 'All-in-one cardio session',
          SMWorkoutLibrary.BodyZone.FullBody, maxExercises,
          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null
        );

        try {

        } catch (e) { }

        try {
          const result = await startCustomWorkout(maxWorkout, getModifications());
          if (result) {
            handleWorkoutCompletion({ summary: result });
          }
        } catch (error) {
          console.error('Error in startCustomWorkout:', error);
          Alert.alert('Workout Error', `Failed to start workout: ${error}`);
        }
      } else if (type === 'CoreCrusher') {
        const coreExercises = [];
        for (let set = 1; set <= 3; set++) {
          coreExercises.push(
            new SMWorkoutLibrary.SMExercise(`Crunches - Set ${set}`, 60, 'Crunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Crunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Oblique Crunches - Set ${set}`, 60, 'ObliqueCrunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ObliqueCrunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`High Plank - Set ${set}`, 60, 'PlankHigh', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankHigh', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Plank - Set ${set}`, 60, 'PlankSide', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSide', '', null)
          );
          if (set < 3) coreExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const coreWorkout = new SMWorkoutLibrary.SMWorkout('CoreCrusher', 'Core Crusher', 'Crush your core', SMWorkoutLibrary.BodyZone.FullBody, coreExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(coreWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'AbsReloaded') {
        const absExercises = [];
        for (let set = 1; set <= 3; set++) {
          absExercises.push(
            new SMWorkoutLibrary.SMExercise(`Crunches - Set ${set}`, 60, 'Crunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'Crunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Tuck Hold - Set ${set}`, 60, 'TuckHold', null, [SMWorkoutLibrary.UIElement.Timer], 'TuckHold', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Oblique Crunches - Set ${set}`, 60, 'ObliqueCrunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ObliqueCrunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Plank - Set ${set}`, 60, 'PlankSide', null, [SMWorkoutLibrary.UIElement.Timer], 'PlankSide', '', null)
          );
          if (set < 3) absExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const absWorkout = new SMWorkoutLibrary.SMWorkout('AbsReloaded', 'Abs Reloaded', 'Core focused routine', SMWorkoutLibrary.BodyZone.FullBody, absExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(absWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'MobilityFlow') {
        const mobilityExercises = [];
        for (let set = 1; set <= 3; set++) {
          mobilityExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jefferson Curl - Set ${set}`, 60, 'JeffersonCurl', null, [SMWorkoutLibrary.UIElement.Timer], 'JeffersonCurl', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Hamstring Mobility - Set ${set}`, 60, 'StandingHamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'StandingHamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Hamstring Mobility - Set ${set}`, 60, 'HamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'HamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Left - Set ${set}`, 60, 'SideBendLeft', null, [SMWorkoutLibrary.UIElement.Timer], 'SideBendLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Right - Set ${set}`, 60, 'SideBendRight', null, [SMWorkoutLibrary.UIElement.Timer], 'SideBendRight', '', null)
          );
          if (set < 3) mobilityExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const mobilityWorkout = new SMWorkoutLibrary.SMWorkout('MobilityFlow', 'Mobility Flow', 'Smooth sequence for flexibility', SMWorkoutLibrary.BodyZone.FullBody, mobilityExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(mobilityWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'DynamicMobility') {
        const dynamicExercises = [];
        for (let set = 1; set <= 3; set++) {
          dynamicExercises.push(
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Left - Set ${set}`, 60, 'StandingKneeRaiseLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Right - Set ${set}`, 60, 'StandingKneeRaiseRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Left - Set ${set}`, 60, 'SideLungeLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Right - Set ${set}`, 60, 'SideLungeRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Hamstring Mobility - Set ${set}`, 60, 'HamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'HamstringMobility', '', null)
          );
          if (set < 3) dynamicExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const dynamicWorkout = new SMWorkoutLibrary.SMWorkout('DynamicMobility', 'Dynamic Mobility', 'Active range of motion work', SMWorkoutLibrary.BodyZone.FullBody, dynamicExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(dynamicWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'GluteBlaster') {
        const gluteExercises = [];
        for (let set = 1; set <= 3; set++) {
          gluteExercises.push(
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Left - Set ${set}`, 60, 'SideLungeLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Right - Set ${set}`, 60, 'SideLungeRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Lunge - Set ${set}`, 60, 'LungeFrontRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '', null)
          );
          if (set < 3) gluteExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const gluteWorkout = new SMWorkoutLibrary.SMWorkout('GluteBlaster', 'Glute Blaster', 'Target and strengthen your glutes', SMWorkoutLibrary.BodyZone.LowerBody, gluteExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(gluteWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'PostureFix') {
        const postureExercises = [];
        for (let set = 1; set <= 3; set++) {
          postureExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jefferson Curl - Set ${set}`, 60, 'JeffersonCurl', null, [SMWorkoutLibrary.UIElement.Timer], 'JeffersonCurl', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Hamstring Mobility - Set ${set}`, 60, 'HamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'HamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Overhead Squat - Set ${set}`, 60, 'SquatOverhead', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatOverhead', '', null)
          );
          if (set < 3) postureExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const postureWorkout = new SMWorkoutLibrary.SMWorkout('PostureFix', 'Posture Fix', 'Improve alignment and posture', SMWorkoutLibrary.BodyZone.FullBody, postureExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(postureWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'MobilityMax') {
        const mobilityMaxExercises = [];
        for (let set = 1; set <= 3; set++) {
          mobilityMaxExercises.push(
            new SMWorkoutLibrary.SMExercise(`Jefferson Curl - Set ${set}`, 60, 'JeffersonCurl', null, [SMWorkoutLibrary.UIElement.Timer], 'JeffersonCurl', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Hamstring Mobility - Set ${set}`, 60, 'StandingHamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'StandingHamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Hamstring Mobility - Set ${set}`, 60, 'HamstringMobility', null, [SMWorkoutLibrary.UIElement.Timer], 'HamstringMobility', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Left - Set ${set}`, 60, 'SideBendLeft', null, [SMWorkoutLibrary.UIElement.Timer], 'SideBendLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Bend Right - Set ${set}`, 60, 'SideBendRight', null, [SMWorkoutLibrary.UIElement.Timer], 'SideBendRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Reverse Sit to Table Top - Set ${set}`, 60, 'ReverseSitToTableTop', null, [SMWorkoutLibrary.UIElement.Timer], 'ReverseSitToTableTop', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Left - Set ${set}`, 60, 'StandingKneeRaiseLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Right - Set ${set}`, 60, 'StandingKneeRaiseRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Overhead Squat - Set ${set}`, 60, 'SquatOverhead', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatOverhead', '', null)
          );
          if (set < 3) mobilityMaxExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const mobilityMaxWorkout = new SMWorkoutLibrary.SMWorkout('MobilityMax', 'Mobility Max', 'Complete mobility session', SMWorkoutLibrary.BodyZone.FullBody, mobilityMaxExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(mobilityMaxWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'SideToSideBurner') {
        const sideExercises = [];
        for (let set = 1; set <= 3; set++) {
          sideExercises.push(
            new SMWorkoutLibrary.SMExercise(`Skater Hops - Set ${set}`, 60, 'SkaterHops', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Left - Set ${set}`, 60, 'StandingKneeRaiseLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Right - Set ${set}`, 60, 'StandingKneeRaiseRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`High Knees - Set ${set}`, 60, 'HighKnees', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Left - Set ${set}`, 60, 'SideLungeLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Right - Set ${set}`, 60, 'SideLungeRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeRight', '', null)
          );
          if (set < 3) sideExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const sideWorkout = new SMWorkoutLibrary.SMWorkout('SideToSideBurner', 'Side to Side Burner', 'Lateral movements for legs', SMWorkoutLibrary.BodyZone.LowerBody, sideExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(sideWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'LowImpactTorch') {
        const lowImpactExercises = [];
        for (let set = 1; set <= 3; set++) {
          lowImpactExercises.push(
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Oblique Crunches - Set ${set}`, 60, 'ObliqueCrunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ObliqueCrunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Left - Set ${set}`, 60, 'StandingKneeRaiseLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Right - Set ${set}`, 60, 'StandingKneeRaiseRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Reverse Sit to Table Top - Set ${set}`, 60, 'ReverseSitToTableTop', null, [SMWorkoutLibrary.UIElement.Timer], 'ReverseSitToTableTop', '', null)
          );
          if (set < 3) lowImpactExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const lowImpactWorkout = new SMWorkoutLibrary.SMWorkout('LowImpactTorch', 'Low Impact Torch', 'Burn calories without impact', SMWorkoutLibrary.BodyZone.FullBody, lowImpactExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(lowImpactWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      } else if (type === 'LowerMax') {
        const lowerMaxExercises = [];
        for (let set = 1; set <= 3; set++) {
          lowerMaxExercises.push(
            new SMWorkoutLibrary.SMExercise(`Glutes Bridge - Set ${set}`, 60, 'GlutesBridge', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'GlutesBridge', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Left - Set ${set}`, 60, 'SideLungeLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Side Lunge Right - Set ${set}`, 60, 'SideLungeRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SideLungeRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Lunge - Set ${set}`, 60, 'LungeFrontRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'LungeFrontRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Air Squat - Set ${set}`, 60, 'SquatRegular', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SquatRegular', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Skater Hops - Set ${set}`, 60, 'SkaterHops', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'SkaterHops', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Left - Set ${set}`, 60, 'StandingKneeRaiseLeft', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseLeft', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Standing Knee Raise Right - Set ${set}`, 60, 'StandingKneeRaiseRight', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'StandingKneeRaiseRight', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`High Knees - Set ${set}`, 60, 'HighKnees', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'HighKnees', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Oblique Crunches - Set ${set}`, 60, 'ObliqueCrunches', null, [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], 'ObliqueCrunches', '', null),
            new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null),
            new SMWorkoutLibrary.SMExercise(`Reverse Sit to Table Top - Set ${set}`, 60, 'ReverseSitToTableTop', null, [SMWorkoutLibrary.UIElement.Timer], 'ReverseSitToTableTop', '', null)
          );
          if (set < 3) lowerMaxExercises.push(new SMWorkoutLibrary.SMExercise('Rest', 90, 'Rest', null, [SMWorkoutLibrary.UIElement.Timer], 'Rest', '', null));
        }
        const lowerMaxWorkout = new SMWorkoutLibrary.SMWorkout('LowerMax', 'Lower Max', 'Complete lower body challenge', SMWorkoutLibrary.BodyZone.LowerBody, lowerMaxExercises, SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null);

        try { const result = await startCustomWorkout(lowerMaxWorkout, getModifications()); if (result) handleWorkoutCompletion({ summary: result }); } catch (error) { Alert.alert('Workout Error', `Failed to start workout: ${error}`); }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not start workout");
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

  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>HOME</Text>
      <View style={styles.pointsBadge}>
        <Image
          source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6B35/fire-element.png' }}
          style={{ width: 16, height: 16, marginRight: 4 }}
        />
        <Text style={styles.pointsText}>{user?.credits || 0}</Text>
      </View>
    </View>
  );

  const Tabs = () => (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              !isActive && styles.inactiveTab // Add spacing for inactive tabs to match
            ]}
          >
            {/* Selection dot (always occupies space to prevent jumping) */}
            <View style={[styles.activeDot, { backgroundColor: '#FF6B35', opacity: isActive ? 1 : 0 }]} />
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
                isActive && tab === 'Character' && { color: '#FF6B35' }, // Character is orange when active
                !isActive && tab === 'Character' && styles.characterTabText,
                !isActive && tab === 'Workouts' && styles.workoutsTabText,
              ]}
            >
              {tab}
            </Text>
          </Pressable >
        );
      })}
    </View >
  );

  const ChallengeCard = ({ data }: { data: any }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        // Fallback or specific logic
        const details = WORKOUT_DETAILS_DATA[data.id];
        if (details) setSelectedWorkout(details);
        else startChallenge(data.id);
      }}
      style={{
        width: responsive.isIPad ? 380 : width * 0.85,
        backgroundColor: '#FFF',
        borderRadius: 24,
        marginHorizontal: 10,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        overflow: 'hidden',
        minHeight: responsive.isIPad ? 480 : 'auto',
      }}
    >
      {/* Header Image with Gradient & Badge */}
      <View style={{ height: responsive.isIPad ? 220 : 160, width: '100%' }}>
        <Image source={typeof data.image === 'string' ? { uri: data.image } : data.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: responsive.isIPad ? 220 : 160, backgroundColor: 'rgba(0,0,0,0.1)' }} />

        {/* Badge */}
        <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }}>
          <Text style={{ fontSize: responsive.isIPad ? 14 : 12, fontWeight: '700', color: '#000', fontFamily: 'Lexend' }}>{data.category.toUpperCase()}</Text>
        </View>

        {/* Avatars Overlay */}
        <View style={{ position: 'absolute', bottom: 12, left: 16, flexDirection: 'row' }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#FFF', marginLeft: i > 1 ? -12 : 0, overflow: 'hidden' }}>
              <Image source={{ uri: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${30 + i}.jpg` }} style={{ width: '100%', height: '100%' }} />
            </View>
          ))}
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginLeft: -12, borderWidth: 2, borderColor: '#FFF' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF' }}>+12</Text>
          </View>
        </View>
      </View>

      {/* Content Body - Infographic Style */}
      <View style={{ padding: responsive.isIPad ? 30 : 20 }}>
        {/* Title & Desc */}
        <Text style={{ fontSize: responsive.isIPad ? 28 : 22, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Lexend', marginBottom: 6 }}>{data.title}</Text>
        <Text style={{ fontSize: responsive.isIPad ? 18 : 14, color: '#666', fontFamily: 'Lexend', lineHeight: responsive.isIPad ? 26 : 20, marginBottom: responsive.isIPad ? 32 : 24 }} numberOfLines={2}>
          {data.description}
        </Text>

        {/* Info Grid - The "Infographic" part */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 16, padding: responsive.isIPad ? 20 : 16, borderWidth: 1, borderColor: '#EEE' }}>
          {/* Goal */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
              <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/FF8C00/trophy.png' }} style={{ width: 16, height: 16 }} />
            </View>
            <Text style={{ fontSize: responsive.isIPad ? 12 : 10, color: '#999', fontWeight: '600', fontFamily: 'Lexend', marginBottom: 2 }}>GOAL</Text>
            <Text style={{ fontSize: responsive.isIPad ? 18 : 14, color: '#1A1A1A', fontWeight: '700', fontFamily: 'Lexend' }}>{data.goal.replace(' POINTS', '')} pts</Text>
          </View>

          <View style={{ width: 1, backgroundColor: '#E0E0E0', height: '60%', alignSelf: 'center' }} />

          {/* Started */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
              <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/4CD964/calendar.png' }} style={{ width: 16, height: 16 }} />
            </View>
            <Text style={{ fontSize: responsive.isIPad ? 12 : 10, color: '#999', fontWeight: '600', fontFamily: 'Lexend', marginBottom: 2 }}>STARTED</Text>
            <Text style={{ fontSize: responsive.isIPad ? 18 : 14, color: '#1A1A1A', fontWeight: '700', fontFamily: 'Lexend' }}>{data.started.split(', ')[0]}</Text>
          </View>

          <View style={{ width: 1, backgroundColor: '#E0E0E0', height: '60%', alignSelf: 'center' }} />

          {/* Status */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
              <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/007AFF/running.png' }} style={{ width: 16, height: 16 }} />
            </View>
            <Text style={{ fontSize: responsive.isIPad ? 12 : 10, color: '#999', fontWeight: '600', fontFamily: 'Lexend', marginBottom: 2 }}>STATUS</Text>
            <Text style={{ fontSize: responsive.isIPad ? 18 : 14, color: '#007AFF', fontWeight: '700', fontFamily: 'Lexend' }}>Active</Text>
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );

  // --- New Screens Imported ---

  const BottomNavBar = () => {
    const navItems = [
      { id: 'Home', icon: 'https://img.icons8.com/ios-filled/50/ffffff/home.png', inactiveIcon: 'https://img.icons8.com/ios/50/cccccc/home.png' },
      // Changed Report to Progress
      // { id: 'Progress', icon: 'https://img.icons8.com/ios-filled/50/ffffff/graph.png', inactiveIcon: 'https://img.icons8.com/ios/50/cccccc/graph.png' },
      { id: 'Profile', icon: 'https://img.icons8.com/ios-filled/50/ffffff/user.png', inactiveIcon: 'https://img.icons8.com/ios/50/cccccc/user.png' },
    ];

    return (
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  LayoutAnimation.configureNext({
                    duration: 300,
                    update: {
                      type: LayoutAnimation.Types.easeOut,
                    },
                  });
                  setActiveNav(item.id);
                }}
                activeOpacity={0.8}
                style={isActive ? styles.navItemActive : styles.navItemInactive}
              >
                {isActive ? (
                  <>
                    <View style={styles.activeIconContainer}>
                      <Image source={{ uri: item.icon }} style={styles.navIconWhite} />
                    </View>
                    <Text style={styles.navTextActive}>{item.id}</Text>
                  </>
                ) : (
                  <Image source={{ uri: item.inactiveIcon }} style={styles.navIconGrey} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- Data ---
  const CHALLENGES = [
    {
      id: 'CardioCrusher',
      title: 'Cardio Crusher',
      description: 'Morning workout with high intensity cardio.',
      category: 'Cardio',
      started: 'Aug 15, 2023',
      goal: '2 000 POINTS',
      image: 'https://ik.imagekit.io/an85p0bgo/icons/cardio-crusher-2.jpg',
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
      image: 'https://cdn.corenexis.com/view/5821312168',
      bgColor: '#FFFFFF',
      action: () => startChallenge('AbsReloaded')
    }
  ];

  return (
    <WorkoutProvider startWorkout={startChallenge}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>

            {/* Main Content Area based on Active Nav */}
            {activeNav === 'Home' ? (
              <>
                <Header />
                <View style={{ flex: 1, backgroundColor: '#F8F7F4' }}>
                  <Tabs />
                  <ScrollView
                    ref={pagerRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    scrollEventThrottle={16}
                  >
                    {/* Page 1: Active */}
                    <ScrollView ref={activeScrollRef} style={{ width: width, flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>

                      {/* Spacing Removed */}

                      {/* Small Daily Card - Moved to Top */}
                      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <TouchableOpacity
                          style={[styles.dailyCard, { flexDirection: 'column', alignItems: 'stretch' }]}
                          onPress={() => {
                            if (isPremium) {
                              showDailyKickstartDetails();
                            } else {
                              setShowPremiumModal(true);
                            }
                          }}
                        >

                          {/* Avatars */}
                          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                            {[1, 2, 3].map((i) => (
                              <View key={i} style={[styles.avatarPlaceholder, { width: 32, height: 32, borderRadius: 16, marginLeft: i > 0 ? -10 : 0, borderWidth: 2, borderColor: 'white' }]}>
                                <Image source={{ uri: `https://randomuser.me/api/portraits/women/${i + 40}.jpg` }} style={styles.avatarImage} />
                              </View>
                            ))}
                            <View style={{ justifyContent: 'center', marginLeft: 12 }}>
                              <Text style={{ color: '#888', fontSize: 12, fontFamily: 'Lexend' }}>+12 Joined</Text>
                            </View>
                          </View>

                          <Text style={[styles.cardTitle, { marginTop: 0, fontSize: responsive.isIPad ? 28 : 20 }]}>Morning Kickstart</Text>

                          {/* Info Rows */}
                          <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                            <Text style={styles.label}>Description:</Text>
                            <Text style={styles.value}>{getDailyWorkoutDescription()}</Text>
                          </View>

                          <View style={styles.infoRow}>
                            <Text style={styles.label}>Difficulty:</Text>
                            <Text style={styles.value}>Beginner</Text>
                          </View>

                          <View style={styles.infoRow}>
                            <Text style={styles.label}>Reward:</Text>
                            <View style={styles.startedValueContainer}>
                              <View style={styles.orangeDot} />
                              <Text style={styles.value}>100 POINTS</Text>
                            </View>
                          </View>

                        </TouchableOpacity>
                      </View>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScrollContent}
                        decelerationRate="fast"
                        snapToAlignment="start"
                        snapToInterval={width * 0.85 + 20} // width + margin
                        nestedScrollEnabled={true}
                      >
                        {CHALLENGES.map((item, index) => (
                          <View key={item.id}>
                            <ChallengeCard data={item} />
                          </View>
                        ))}
                      </ScrollView>
                    </ScrollView>


                    {/* Page 3: Completed */}
                    <ScrollView ref={completedScrollRef} style={{ width: width, backgroundColor: '#FAF9F6' }} contentContainerStyle={{ paddingBottom: 100 }}>
                      {/* Featured Completed Workout */}
                      {/* Featured - Horizontal Scroll */}
                      <ScrollView
                        horizontal
                        nestedScrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingBottom: 25, marginTop: 10 }}
                      >
                        {[
                          {
                            id: 'Featured_UpperBody',
                            title: 'Upper Body Circuit',
                            coach: 'coach Laura',
                            duration: '30',
                            img: 'https://ik.imagekit.io/an85p0bgo/icons/upper-body-circuit.jpg',
                            tag: 'Strength'
                          },
                          {
                            id: 'Featured_CoreCrusher',
                            title: 'Core Crusher',
                            coach: 'coach Mike',
                            duration: '18',
                            img: 'https://ik.imagekit.io/an85p0bgo/icons/core-crusher-2.jpg',
                            tag: 'Core'
                          },
                          {
                            id: 'Featured_HIITExpress',
                            title: 'HIIT Express',
                            coach: 'coach Sarah',
                            duration: '24',
                            img: 'https://ik.imagekit.io/an85p0bgo/icons/hiit-express-2.jpg',
                            tag: 'Cardio'
                          },
                          {
                            id: 'Featured_MobilityFlow',
                            title: 'Mobility Flow',
                            coach: 'coach Alex',
                            duration: '30',
                            img: 'https://ik.imagekit.io/an85p0bgo/icons/mobility-flow.jpg',
                            tag: 'Mobility'
                          },
                          {
                            id: 'Featured_GluteBlaster',
                            title: 'Glute Blaster',
                            coach: 'coach John',
                            duration: '24',
                            img: 'https://ik.imagekit.io/an85p0bgo/icons/glute-blaster.jpg',
                            tag: 'Lower Body'
                          },
                          {
                            id: 'Featured_PowerPlyo',
                            title: 'Power Plyo',
                            coach: 'coach Steve',
                            duration: '18',
                            img: 'https://cdn.corenexis.com/view/9923452168',
                            tag: 'Athletic'
                          }
                        ].map((item, idx) => (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={0.95}
                            onPress={() => {
                              if (!isPremium) {
                                setShowPremiumModal(true);
                                return;
                              }
                              const details = BODY_FOCUS_DETAILS[item.id];
                              if (details) setSelectedWorkout(details);
                            }}
                            style={{
                              width: width - 60,
                              backgroundColor: '#000',
                              borderRadius: 24,
                              minHeight: 280,
                              position: 'relative',
                              overflow: 'hidden',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 10 },
                              shadowOpacity: 0.15,
                              shadowRadius: 12,
                              elevation: 8
                            }}
                          >
                            <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.6 }} resizeMode="cover" />
                            <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.2)' }} />

                            <View style={{ padding: 24, flex: 1, justifyContent: 'space-between' }}>
                              <View>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 12 }}>
                                  <Text style={{ fontSize: 12, color: '#FFF', fontWeight: '600', fontFamily: 'Lexend', textTransform: 'uppercase', letterSpacing: 1 }}>{item.tag}</Text>
                                </View>
                                <Text style={{ fontSize: 28, fontWeight: '600', color: '#FFF', fontFamily: 'Lexend', lineHeight: 34, marginBottom: 6 }}>{item.title}</Text>
                                <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', fontFamily: 'Lexend', fontWeight: '400' }}>By {item.coach}</Text>
                              </View>

                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 42, fontWeight: '600', color: '#FFF', fontFamily: 'Lexend' }}>{item.duration}<Text style={{ fontSize: 20 }}> min</Text></Text>

                                <TouchableOpacity
                                  onPress={() => {
                                    if (!isPremium) {
                                      setShowPremiumModal(true);
                                      return;
                                    }
                                    const details = BODY_FOCUS_DETAILS[item.id];
                                    if (details) setSelectedWorkout(details);
                                  }}
                                  style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }}>
                                  <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/play.png' }} style={{ width: 28, height: 28, marginLeft: 4 }} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      {/* Filter Tabs */}
                      <ScrollView
                        horizontal
                        nestedScrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 40, paddingVertical: 8, marginBottom: 12 }}
                      >
                        {['Strength', 'Cardio', 'Core', 'Mobility', 'Lower'].map((filter, idx) => (
                          <TouchableOpacity
                            key={filter}
                            onPress={() => setSelectedFilter(filter)}
                            style={{
                              paddingHorizontal: 24,
                              paddingVertical: 12,
                              borderRadius: 24,
                              backgroundColor: selectedFilter === filter ? '#FF6B35' : 'white',
                              marginRight: 12,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 1 },
                              shadowOpacity: 0.05,
                              shadowRadius: 2,
                              elevation: 1,
                            }}
                          >
                            <Text style={{
                              fontSize: 15,
                              fontWeight: '600',
                              color: selectedFilter === filter ? 'white' : '#666',
                              fontFamily: 'Lexend'
                            }}>{filter}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {WORKOUT_PROGRAMS.filter(p => p.category === selectedFilter).map((program) => (
                          <TouchableOpacity
                            key={program.id}
                            onPress={() => {
                              if (!isPremium) {
                                setShowPremiumModal(true);
                                return;
                              }
                              setSelectedWorkout(WORKOUT_DETAILS_DATA[program.id]);
                            }}
                            style={{
                              width: (width - 52) / 2,
                              backgroundColor: 'white',
                              borderRadius: 24,
                              overflow: 'hidden',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.08,
                              shadowRadius: 4,
                              elevation: 2,
                              marginBottom: 16
                            }}
                          >
                            <View style={{ height: 140, backgroundColor: '#f0f0f0' }}>
                              <Image source={typeof program.image === 'string' ? { uri: program.image } : program.image} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row' }}>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 6 }}>
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#000', fontFamily: 'Lexend' }}>{program.time}</Text>
                                </View>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#000', fontFamily: 'Lexend' }}>{program.tag}</Text>
                                </View>
                              </View>
                            </View>
                            <View style={{ padding: 16 }}>
                              <Text style={{ fontSize: 16, fontWeight: '700', color: '#000', fontFamily: 'Lexend', marginBottom: 4 }}>{program.title}</Text>
                              <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Lexend' }} numberOfLines={2}>{program.desc}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                        {WORKOUT_PROGRAMS.filter(p => p.category === selectedFilter).length === 0 && (
                          <View style={{ width: '100%', alignItems: 'center', padding: 20 }}>
                            <Text style={{ color: '#999', fontFamily: 'Lexend' }}>No workouts found for {selectedFilter}</Text>
                          </View>
                        )}
                      </View>

                      {/* Body Focus Area */}
                      <View style={{ marginBottom: 30 }}>
                        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                          <Text style={{ fontSize: 22, fontWeight: '700', color: '#000', fontFamily: 'Lexend' }}>Body Focus Area</Text>
                        </View>

                        <ScrollView
                          horizontal={true}
                          nestedScrollEnabled={true}
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{
                            paddingHorizontal: 20,
                            flexDirection: 'column',
                            flexWrap: 'wrap',
                            height: responsive.isIPad ? 310 : 230, // Force 2 rows
                            gap: 16,
                          }}
                        >
                          {[
                            { title: 'Shoulders', img: 'https://ik.imagekit.io/an85p0bgo/icons/shoulder-exercise.jpg' },
                            { title: 'Chest', img: 'https://cdn.corenexis.com/view/4781723168' },
                            { title: 'Thighs', img: 'https://ik.imagekit.io/an85p0bgo/icons/thigh-exercise.jpg' },
                            { title: 'Hips & Glutes', img: 'https://ik.imagekit.io/an85p0bgo/icons/hips-glutes-exercise.jpg' },
                            { title: 'Calves', img: 'https://ik.imagekit.io/an85p0bgo/icons/calves-exercise.jpg' },
                            { title: 'Arms', img: 'https://cdn.corenexis.com/view/2352672168' },
                            { title: 'Abs', img: 'https://ik.imagekit.io/an85p0bgo/abs-exercise.jpg' },
                            { title: 'PlankCore', img: 'https://ik.imagekit.io/an85p0bgo/icons/plank-core-exercise.jpg' },
                          ].map((item, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                if (!isPremium) {
                                  setShowPremiumModal(true);
                                  return;
                                }
                                const details = BODY_FOCUS_DETAILS[item.title];
                                if (details) {
                                  setSelectedWorkout(details);
                                } else {
                                  navigation.navigate('BodyFocus');
                                }
                              }}
                              style={{
                                width: responsive.isIPad ? 190 : 140,
                                height: responsive.isIPad ? 140 : 100,
                              }}
                            >
                              <View style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 16,
                                overflow: 'hidden',
                                backgroundColor: '#f0f0f0',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                              }}>
                                <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                <View style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(0,0,0,0.6)',
                                  paddingVertical: 8,
                                  paddingHorizontal: 10
                                }}>
                                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff', fontFamily: 'Lexend' }}>
                                    {item.title === 'PlankCore' ? 'Plank & Core' : item.title}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>


                    </ScrollView>
                  </ScrollView>
                </View>
              </>
            ) : activeNav === 'Progress' ? (
              <ProgressScreen />
            ) : (
              <ProfileScreen navigation={navigation} />
            )}

            <BottomNavBar />
          </SafeAreaView>

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={{ color: 'white', fontWeight: '700', fontFamily: 'Lexend' }}>Initializing AI Engine...</Text>
            </View>
          )}

          {/* Summary Modal */}
          <Modal visible={showSummary} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
              <View style={styles.workoutCompleteModal}>
                {/* Celebration Header */}
                <View style={styles.celebrationHeader}>
                  <Text style={styles.celebrationEmoji}>🎉</Text>
                  <Text style={styles.workoutCompleteTitle}>Workout Complete!</Text>
                  <Text style={styles.workoutCompleteSubtitle}>Great job pushing through!</Text>
                </View>

                {/* Stats Cards */}
                {summaryData?.exercises && (
                  <View style={styles.statsContainer}>
                    {summaryData.exercises
                      .filter((ex: any) => ex.reps_performed > 0)
                      .map((ex: any, idx: number) => {
                        const exerciseName = ex.exercise_info?.exercise_id || 'Exercise';
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
                            <View style={styles.statCardBody}>
                              <View style={styles.statItem}>
                                <Text style={styles.statValue}>{totalReps}</Text>
                                <Text style={styles.statLabel}>Total Reps</Text>
                              </View>
                              <View style={styles.statDivider} />
                              <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#4CAF50' }]}>{perfectReps}</Text>
                                <Text style={styles.statLabel}>Perfect Reps</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                  </View>
                )}

                {/* Credits Earned */}
                <View style={styles.creditsEarnedCard}>
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

                {/* Done Button */}
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowSummary(false)}
                >
                  <Text style={styles.doneButtonText}>Continue</Text>
                </TouchableOpacity>
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

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.detailTitle}>{selectedWorkout?.title}</Text>
                    <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                      <Text style={{ fontSize: 24, color: '#999' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.detailDesc}>{selectedWorkout?.description}</Text>

                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, fontFamily: 'Lexend' }}>Exercises</Text>

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
                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 12 }}>
                          {iconUrl ? (
                            <Image source={{ uri: iconUrl }} style={{ width: 24, height: 24, marginRight: 8, tintColor: '#FF6B35' }} resizeMode="contain" />
                          ) : null}
                          <Text style={{ fontSize: 18, fontWeight: '700', fontFamily: 'Lexend', color: '#FF6B35' }}>
                            {cleanTitle.replace(/🔥|🏆/g, '').trim()}
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View
                        key={idx}
                        style={styles.exerciseItem}
                      >
                        <View style={styles.exerciseIndex}>
                          <Text style={styles.exerciseIndexText}>{ex.displayIndex || idx + 1}</Text>
                        </View>
                        <View style={styles.exerciseInfo}>
                          <Text style={styles.exerciseName}>{ex.name}</Text>
                          <Text style={styles.exerciseDetail}>{ex.detail}</Text>
                        </View>
                      </View>
                    )
                  })}

                  <View style={{ height: 100 }} />
                </ScrollView>

                <View style={{ position: 'absolute', bottom: 30, left: 24, right: 24 }}>
                  {/* Check if workout is implemented */}
                  {['Shoulders', 'Chest', 'Thighs', 'Hips & Glutes', 'Calves', 'Arms', 'Abs', 'PlankCore', 'Featured_UpperBody', 'Featured_CoreCrusher', 'Featured_HIITExpress', 'Featured_MobilityFlow', 'Featured_GluteBlaster', 'Featured_PowerPlyo', 'CardioCrusher', 'AbsReloaded', 'UpperBodyStrength', 'FullBodyBuilder', 'HIITExpress', 'SweatCircuit', 'CardioMax', 'CoreCrusher', 'MobilityFlow', 'DynamicMobility', 'PostureFix', 'MobilityMax', 'GluteBlaster', 'SideToSideBurner', 'LowImpactTorch', 'LowerMax', 'DailyKickstart', 'ChestProgram', 'ArmsProgram', 'LegsProgram'].includes(selectedWorkout?.id) ? (
                    <TouchableOpacity
                      style={styles.startButton}
                      activeOpacity={0.8}
                      onPress={async () => {
                        // Check premium status before starting workout
                        const isPremiumUser = await checkIsPremium();

                        if (!isPremiumUser) {
                          // Show premium modal directly for non-premium users
                          setSelectedWorkout(null);
                          setTimeout(() => {
                            setShowPremiumModal(true);
                          }, 300);
                          return;
                        }

                        // Premium user - proceed with workout
                        const id = selectedWorkout?.id;
                        setSelectedWorkout(null);
                        // Wait for modal to close then start
                        setTimeout(() => {
                          console.log('Starting workout:', id);
                          if (id === 'DailyKickstart') {
                            startDailyKickstart();
                          } else {
                            startChallenge(id);
                          }
                        }, 600);
                      }}
                    >
                      <Text style={styles.startButtonText}>Start Workout</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.startButton, { backgroundColor: '#999' }]}>
                      <Text style={styles.startButtonText}>Coming Soon</Text>
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



        </View>
      </SafeAreaProvider>
    </WorkoutProvider>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Changed to White for Status Bar matching
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
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Lexend',
    marginBottom: 8,
  },
  detailDesc: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Lexend',
    marginBottom: 24,
    lineHeight: 22,
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
  exerciseName: {
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
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Lexend',
  },
});

const Stack = createStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In
    const { GoogleSignin } = require('@react-native-google-signin/google-signin');
    GoogleSignin.configure({
      iosClientId: '912055738866-63pugaqc2m9s04gcv8qg5volltl6u2uo.apps.googleusercontent.com',
      webClientId: '912055738866-ho32cblfdh4ckfgjvnu5l8n6u2glp8de.apps.googleusercontent.com',
      offlineAccess: true,
    });

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
        const onboardingCompleted = user?.onboardingCompleted || await OnboardingService.isOnboardingComplete();

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
      // Default to login on error
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
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;