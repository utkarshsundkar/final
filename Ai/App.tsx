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
import BodyFocusScreen from './src/screens/BodyFocusScreen';
import { WorkoutProvider } from './src/context/WorkoutContext';
import ExerciseService from './src/services/ExerciseService';
// import WorkoutVideoPip from './src/components/WorkoutVideoPip';
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
  Animated,
  Platform,
  LogBox,
  AppState
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
import { UIManager } from 'react-native';
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
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Burpees', detail: '10 reps x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'FatBurnHIIT': {
    id: 'FatBurnHIIT',
    title: 'Fat Burn HIIT',
    description: 'Maximum calorie burn with explosive movements - 4 sets',
    exercises: [
      { name: 'Burpees', detail: '12 reps x 4 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 4 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'High Knees', detail: '45s x 4 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Jumping Jacks', detail: '60s x 4 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
    ]
  },
  'AbsReloaded': {
    id: 'AbsReloaded',
    title: 'Abs Reloaded',
    description: 'Core focused routine for defined abs - 3 sets',
    exercises: [
      { name: 'Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
      { name: 'Russian Twists', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
      { name: 'Cross Sit up', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185520/Cross_Sit_up_ffcwzn.mp4' },
      { name: 'Side Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
    ]
  },
  'power_squad': {
    id: 'power_squad',
    title: 'Power Squad',
    description: 'Focus on explosive power and leg strength.',
    exercises: [
      { name: 'Squats', detail: '20 reps', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Lunges', detail: '15 reps each', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Burpees', detail: '10 reps', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
    ]
  },
  'UpperBodyStrength': {
    id: 'UpperBodyStrength',
    title: 'Upper Body Strength',
    description: 'Focus on Upper Body strength - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Shoulder Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'FullBodyBuilder': {
    id: 'FullBodyBuilder',
    title: 'Full-Body Builder',
    description: 'Complete full body workout - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Overhead Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'HIITExpress': {
    id: 'HIITExpress',
    title: 'HIIT Express',
    description: 'Quick high intensity cardio - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'SweatCircuit': {
    id: 'SweatCircuit',
    title: 'Sweat Circuit',
    description: 'Full body sweat session - 3 sets',
    exercises: [
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
    ]
  },
  'CardioMax': {
    id: 'CardioMax',
    title: 'Cardio Max',
    description: 'Ultimate cardio challenge for experts - 5 sets',
    exercises: [
      { name: 'Burpees', detail: '15 reps x 5 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
      { name: 'Mountain Climbers', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'High Knees', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Jumping Jacks', detail: '90s x 5 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
      { name: 'Plank butt kicks', detail: '60s x 5 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/plank_butt_kicks_wcnxid.mp4' },
    ]
  },
  'CoreCrusher': {
    id: 'CoreCrusher',
    title: 'Core Crusher',
    description: 'Intense core workout.',
    exercises: [
      { name: 'Tuck Hold', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Oblique Crunches', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
      { name: 'Side Plank Left', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
      { name: 'Side Plank Right', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
    ]
  },
  'MobilityFlow': {
    id: 'MobilityFlow',
    title: 'Mobility Flow',
    description: 'Smooth mobility sequence.',
    exercises: [
      { name: 'Jefferson Curl', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Standing Hamstring Mobility', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Hamstring Mobility', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Bend Left', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
      { name: 'Side Bend Right', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
    ]
  },
  'DynamicMobility': {
    id: 'DynamicMobility',
    title: 'Dynamic Mobility',
    description: 'Active movement for range of motion.',
    exercises: [
      { name: 'Reverse Sit to Table Top', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Standing Knee Raise Left', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Standing Knee Raise Right', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Side Bend Left', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
      { name: 'Side Bend Right', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
    ]
  },
  'PostureFix': {
    id: 'PostureFix',
    title: 'Posture Fix',
    description: 'Improve alignment and posture - 3 sets',
    exercises: [
      { name: 'Jefferson Curl', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Overhead Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'MobilityMax': {
    id: 'MobilityMax',
    title: 'Mobility Max',
    description: 'Complete mobility session - 3 sets',
    exercises: [
      { name: 'Jefferson Curl', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Standing Hamstring Mobility', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Bend Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
      { name: 'Side Bend Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Overhead Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'GluteBlaster': {
    id: 'GluteBlaster',
    title: 'Glute Blaster',
    description: 'Sculpt and tone your glutes.',
    exercises: [
      { name: 'Glutes Bridge', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Side Lunge Left', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Right', detail: '30s', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Lunge', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Air Squat', detail: '30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'SideToSideBurner': {
    id: 'SideToSideBurner',
    title: 'Side to Side Burner',
    description: 'Lateral movements for legs - 3 sets',
    exercises: [
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'LowImpactTorch': {
    id: 'LowImpactTorch',
    title: 'Low Impact Torch',
    description: 'Burn calories without impact - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets' },
    ]
  },
  'LowerMax': {
    id: 'LowerMax',
    title: 'Lower Max',
    description: 'Complete lower body challenge - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Standing Knee Raise Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'Standing Knee Raise Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
      { name: 'Reverse Sit to Table Top', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'ChestProgram': {
    id: 'ChestProgram',
    title: 'Chest Program',
    description: 'Focus on proper form and chest development - 3 sets',
    exercises: [
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Shoulder Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'ArmsProgram': {
    id: 'ArmsProgram',
    title: 'Arms Program',
    description: 'Increase weights gradually for arm strength - 3 sets',
    exercises: [
      { name: 'Shoulder Press', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'LegsProgram': {
    id: 'LegsProgram',
    title: 'Legs Program',
    description: 'Build strength and endurance in your legs - 3 sets',
    exercises: [
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Bulgarian Split Squats', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185512/Bulgarian_Split_Squats_sohzay.mp4' },
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
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
    ]
  },
  'EliteYoga': {
    id: 'EliteYoga',
    title: 'Elite Yoga',
    description: 'Advanced yoga flow for flexibility and balance - 3 sets',
    exercises: [
      { name: 'Yoga - Downward Facing Dog', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Downward_Facing_Dog_Adho_Mukha_Svanasana_pbmmtu.mp4' },
      { name: 'Yoga - Ustrasana', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185591/Yoga_-_ustrasana_ruoegj.mp4' },
      { name: 'Yoga - Baddha Konasana', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
      { name: 'Yoga - Supta Kapotasana', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Supta_Kapotasana_k57xyr.mp4' },
      { name: 'Shoulder stand', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185512/Shoulder_stand_qrkpq5.mp4' },
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
      { name: 'Push-ups', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'High Plank Hold', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Thighs': {
    id: 'Thighs',
    title: 'Thunder Thighs',
    description: 'Strengthen your quads and hamstrings - 3 sets',
    exercises: [
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Ski Jumps', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Jumps', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Hips & Glutes': {
    id: 'Hips & Glutes',
    title: 'Glute Gains',
    description: 'Target the glutes and hips - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge (Left)', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Calves': {
    id: 'Calves',
    title: 'Calf Craze',
    description: 'Build powerful calves - 3 sets',
    exercises: [
      { name: 'Calf Raises', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
      { name: 'Jumping Jacks', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
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
      { name: 'Alternate toe touch', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185509/Alternate_toe_touch_znwlix.mp4' },
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
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
      { name: 'Side Lunge (Left)', detail: '60s x 3 sets' },
      { name: 'Side Lunge (Right)', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
    ]
  },
  'Featured_CoreCrusher': {
    id: 'Featured_CoreCrusher',
    title: 'Core Crusher',
    description: 'Intense core session - 3 sets',
    exercises: [
      { name: 'Tuck Hold', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Oblique Crunches', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
      { name: 'Side Plank', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
    ]
  },
  'Featured_HIITExpress': {
    id: 'Featured_HIITExpress',
    title: 'HIIT Express',
    description: 'High intensity cardio blast - 3 sets',
    exercises: [
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
      { name: 'Skater Hops', detail: '60s x 3 sets' },
      { name: 'Shoulder Taps Plank', detail: '60s x 3 sets' },
      { name: 'Air Squat', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
    ]
  },
  'Featured_MobilityFlow': {
    id: 'Featured_MobilityFlow',
    title: 'Mobility Flow',
    description: 'Improve flexibility and range of motion - 3 sets',
    exercises: [
      { name: 'Hip Rotation', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
      { name: 'Jefferson Curl', detail: '60s x 3 sets' },
      { name: 'Standing Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Hamstring Mobility', detail: '60s x 3 sets' },
      { name: 'Side Bend Left', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
      { name: 'Side Bend Right', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/side_bend_tpmp53.mp4' },
    ]
  },
  'Featured_GluteBlaster': {
    id: 'Featured_GluteBlaster',
    title: 'Glute Blaster',
    description: 'Sculpt and strengthen your glutes - 3 sets',
    exercises: [
      { name: 'Glutes Bridge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/djmbrbq7t/video/upload/v1772183064/4117854-sd_540_960_25fps_x64xfx.mp4' },
      { name: 'Side Lunge Left', detail: '60s x 3 sets' },
      { name: 'Side Lunge Right', detail: '60s x 3 sets' },
      { name: 'Lunge', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
    ]
  },
  'Featured_PowerPlyo': {
    id: 'Featured_PowerPlyo',
    title: 'Power Plyo',
    description: 'Explosive plyometrics - 3 sets',
    exercises: [
      { name: 'Jumps', detail: '60s x 3 sets' },
      { name: 'Ski Jumps', detail: '60s x 3 sets' },
      { name: 'High Knees', detail: '60s x 3 sets', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/High_Knees_b9raf7.mp4' },
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

// --- Constants ---
const WORKOUT_FILTERS = ['Strength', 'Cardio', 'Core', 'Mobility', 'Lower'];

// --- Helper Components ---
const BottomNavBar = React.memo(({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (val: string) => void }) => {
  const navItems = [
    { id: 'Home', activeIcon: 'https://img.icons8.com/ios-filled/50/ffffff/home.png', inactiveIcon: 'https://img.icons8.com/ios/50/ffffff/home.png', label: 'Home' },
    { id: 'Progress', activeIcon: 'https://img.icons8.com/ios-filled/50/ffffff/graph.png', inactiveIcon: 'https://img.icons8.com/ios/50/ffffff/graph.png', label: 'Progress' },
    { id: 'Profile', activeIcon: 'https://img.icons8.com/ios-filled/50/ffffff/user.png', inactiveIcon: 'https://img.icons8.com/ios/50/ffffff/user.png', label: 'Profile' },
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
                style={{ width: 24, height: 24, marginBottom: 4, tintColor: isActive ? '#1C1C1E' : '#8E8E93' }}
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
  const [isDemoPhase, setIsDemoPhase] = useState(true); // New state for demo phase
  const [videoRate, setVideoRate] = useState(1.0); // State to control video speed
  const exerciseTime = workout?.exerciseDuration || 90;
  const restTime = workout?.restDuration || 20; // Default to 20 if not specified
  const [timer, setTimer] = useState(exerciseTime);
  const currentExercise = exercises[currentIndex];
  const nextExercise = exercises[currentIndex + 1];

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AuthService.getCurrentUser().then(setUser);
  }, []);

  // Trigger demo phase for the first set of every new exercise
  useEffect(() => {
    if (!isResting) {
      // Find the first index where this specific exercise appears in the workout list
      const firstOccurrenceIndex = exercises.findIndex(ex => ex.name === currentExercise?.name);

      // It's the "First Set" if this is the first time we see this name in the list, 
      // or if it's explicitly labeled as Set 1/1st Set.
      const isFirstSet = (firstOccurrenceIndex === currentIndex) ||
        currentExercise?.detail?.toLowerCase().includes('set 1') ||
        currentExercise?.detail?.toLowerCase().includes('1st set');

      if (currentExercise?.videoUrl && isFirstSet) {
        setIsDemoPhase(true);
        setVideoRate(1.0); // Reset rate for new demo
      } else {
        setIsDemoPhase(false);
        setVideoRate(1.0);
      }
    }
  }, [currentIndex, isResting, currentExercise?.videoUrl, currentExercise?.name, currentExercise?.detail]);

  const onVideoLoad = (data: any) => {
    // If video is longer than 5s and we are in demo phase, fast forward
    if (isDemoPhase && data.duration > 5) {
      setVideoRate(2.0);
    } else {
      setVideoRate(1.0);
    }
  };

  const completeWorkout = async () => {
    if (user?.id && workout?.title) {
      try {
        console.log('Completing workout:', workout.title);
        // Map current exercises to a format expected by the backend
        const results = exercises.map((ex: any) => ({
          name: ex.name,
          reps_performed: 1, // Placeholder since we don't have AI tracking in this mode
          reps_performed_perfect: 1
        }));

        // Calculate total duration: number of exercises * exercise duration + rests
        const totalDuration = (exercises.length * exerciseTime) + ((exercises.length - 1) * restTime);

        await ExerciseService.saveWorkoutCompletion(
          user.id,
          workout.title,
          results,
          true,
          totalDuration
        );
      } catch (e) {
        console.error('Failed to save workout completion', e);
      }
    }
  };

  // Auto-close workout when the final exercise timer hits 0
  useEffect(() => {
    if (timer === 0 && currentIndex === exercises.length - 1 && !isResting) {
      completeWorkout().then(() => navigation.goBack());
    }
  }, [timer, currentIndex, isResting, exercises.length, navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Pause timer during demo phase
      if (isDemoPhase && !isResting) return;

      setTimer((prev: number) => {
        if (prev > 0) return prev - 1;

        // When timer hits 0
        if (isResting) {
          setIsResting(false);
          setCurrentIndex(c => c + 1);
          return exerciseTime; // Next exercise duration
        } else if (currentIndex < exercises.length - 1) {
          setIsResting(true);
          return restTime; // Rest duration
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentIndex, isResting, exerciseTime, restTime, isDemoPhase]);

  const handleNext = () => {
    if (isResting) {
      setIsResting(false);
      setCurrentIndex(currentIndex + 1);
      setTimer(exerciseTime);
    } else if (currentIndex < exercises.length - 1) {
      setIsResting(true);
      setTimer(restTime);
    } else {
      // Automatically close if user manually presses next on the last exercise
      completeWorkout().then(() => navigation.goBack());
    }
  };

  const handlePrev = () => {
    if (isResting) {
      setIsResting(false);
      setTimer(exerciseTime);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsResting(false);
      setTimer(exerciseTime);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Progress 0→1 as time elapses
  const totalTime = isResting ? restTime : exerciseTime;
  const progressPct = totalTime > 0 ? ((totalTime - timer) / totalTime) * 100 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── VIDEO AREA (takes all space above panel) ── */}
      <View style={{ flex: 1, overflow: 'hidden' }}>

        {isResting ? (
          /* REST STATE */
          <View style={{ flex: 1, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              width: 140, height: 140, borderRadius: 70,
              backgroundColor: 'rgba(255,107,53,0.08)', borderWidth: 1.5,
              borderColor: 'rgba(255,107,53,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 28
            }}>
              <View style={{
                width: 90, height: 90, borderRadius: 45,
                backgroundColor: 'rgba(255,107,53,0.12)', justifyContent: 'center', alignItems: 'center'
              }}>
                <Image
                  source={{ uri: 'https://img.icons8.com/ios-filled/100/ff6b35/meditation.png' }}
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={{
              color: '#FF6B35', fontSize: 11, fontWeight: '700', fontFamily: 'Lexend',
              textTransform: 'uppercase', letterSpacing: 3.5, marginBottom: 10
            }}>Rest & Recover</Text>
            <Text style={{ color: '#1C1C1E', fontSize: 26, fontWeight: '900', fontFamily: 'Lexend', textAlign: 'center' }}>
              Take a Breath
            </Text>
            {nextExercise && (
              <Text style={{ color: 'rgba(28,28,30,0.45)', fontSize: 14, fontFamily: 'Lexend', marginTop: 8 }}>
                Up next: {nextExercise.name}
              </Text>
            )}
          </View>
        ) : currentExercise.videoUrl ? (
          /* VIDEO */
          <Video
            source={{ uri: currentExercise.videoUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            repeat={!isDemoPhase}
            rate={videoRate}
            onLoad={onVideoLoad}
            onEnd={() => {
              if (isDemoPhase) setIsDemoPhase(false);
            }}
            muted
            playInBackground={false}
            playWhenInactive={false}
          />
        ) : (
          /* NO VIDEO FALLBACK */
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '800', fontFamily: 'Lexend' }}>
              {currentExercise.name}
            </Text>
            <Text style={{ color: '#8E8E93', fontSize: 16, fontFamily: 'Lexend', marginTop: 8 }}>
              Keep going! You're doing great.
            </Text>
          </View>
        )}

        {/* Subtle top scrim for nav bar readability */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 110,
          backgroundColor: 'rgba(255,255,255,0.1)'
        }} pointerEvents="none" />

        {/* Top bar */}
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          paddingTop: 56, paddingHorizontal: 20,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 14,
            paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F7'
          }}>
            <Text style={{
              color: isResting ? '#FF8C42' : (isDemoPhase ? '#FF6B35' : '#1C1C1E'), fontSize: 12,
              fontWeight: '700', fontFamily: 'Lexend', textTransform: 'uppercase', letterSpacing: 1.5
            }}>
              {isResting ? '🔥  REST' : (isDemoPhase ? '📺  TUTORIAL' : `${currentIndex + 1}  /  ${exercises.length}`)}
            </Text>
          </View>

          {isDemoPhase && !isResting && (
            <TouchableOpacity
              onPress={() => setIsDemoPhase(false)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 16,
                paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#F2F2F7'
              }}>
              <Text style={{ color: '#FF6B35', fontSize: 12, fontWeight: '800', fontFamily: 'Lexend' }}>SKIP ›</Text>
            </TouchableOpacity>
          )}

          {!isDemoPhase && (
            <TouchableOpacity
              onPress={() => Alert.alert('Quit Workout?',
                'Your progress for this session will be lost. Are you sure?',
                [{ text: 'Keep Going', style: 'cancel' },
                { text: 'Yes, Quit', onPress: () => navigation.goBack(), style: 'destructive' }])}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 1,
                borderColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center'
              }}>
              <Text style={{ color: '#1C1C1E', fontSize: 17, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── BOTTOM PANEL ── */}
      {!isDemoPhase && (
        <View style={{
          backgroundColor: '#FFFFFF', paddingHorizontal: 24,
          paddingTop: 16, paddingBottom: 44, borderTopWidth: 1, borderColor: '#F2F2F7'
        }}>

          {/* Exercise name */}
          {!isResting && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{
                color: 'rgba(28,28,30,0.40)', fontSize: 10, fontWeight: '700',
                fontFamily: 'Lexend', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 2
              }}>
                Now Performing
              </Text>
              <Text style={{ color: '#1C1C1E', fontSize: 18, fontWeight: '900', fontFamily: 'Lexend' }}>
                {currentExercise.name}
              </Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={{
            height: 3, backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 2, marginBottom: 16, overflow: 'hidden'
          }}>
            <View style={{
              height: 3, width: `${Math.min(progressPct, 100)}%` as any,
              backgroundColor: '#FF6B35', borderRadius: 2
            }} />
          </View>

          {/* Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={handlePrev}
              disabled={currentIndex === 0 && !isResting}
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: '#F8F9FB', borderWidth: 1,
                borderColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center',
                opacity: currentIndex === 0 && !isResting ? 0.25 : 1
              }}>
              <Text style={{ color: '#1C1C1E', fontSize: 24 }}>‹</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{
                color: isResting ? '#FF8C42' : '#1C1C1E',
                fontSize: responsive.rf(50), fontWeight: '900', fontFamily: 'Lexend', letterSpacing: -1
              }}>
                {formatTime(timer)}
              </Text>
              <Text style={{
                color: 'rgba(28,28,30,0.30)', fontSize: 10,
                fontFamily: 'Lexend', textTransform: 'uppercase', letterSpacing: 2.5
              }}>
                {isResting ? 'Rest' : 'Work'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleNext}
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: (currentIndex === exercises.length - 1 && !isResting) ? '#FF6B35' : '#F8F9FB',
                borderWidth: 1,
                borderColor: (currentIndex === exercises.length - 1 && !isResting) ? '#FF6B35' : '#F2F2F7',
                justifyContent: 'center', alignItems: 'center',
                shadowColor: '#FF6B35',
                shadowOpacity: (currentIndex === exercises.length - 1 && !isResting) ? 0.5 : 0,
                shadowRadius: 12, elevation: 5
              }}>
              {currentIndex === exercises.length - 1 && !isResting
                ? <Text style={{ color: '#FFF', fontSize: 22 }}>✓</Text>
                : <Text style={{ color: '#FF6B35', fontSize: 24 }}>›</Text>}
            </TouchableOpacity>
          </View>

          {/* Next hint */}
          {nextExercise && !isResting && (
            <View style={{
              marginTop: 14, flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F8F9FB', borderRadius: 10, padding: 11, paddingHorizontal: 14,
              borderWidth: 1, borderColor: '#F2F2F7'
            }}>
              <Text style={{
                color: 'rgba(28,28,30,0.4)', fontSize: 10, fontFamily: 'Lexend',
                textTransform: 'uppercase', letterSpacing: 1.5, marginRight: 8
              }}>Next</Text>
              <Text style={{ color: 'rgba(28,28,30,0.7)', fontSize: 13, fontFamily: 'Lexend', fontWeight: '600' }}>
                {nextExercise.name}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const MainTabScreen = ({ navigation }: any) => {
  // const [didConfig, setDidConfig] = useState(false); // Sency Config moved to App.tsx
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Active');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showTestMenu, setShowTestMenu] = useState(false);
  const [testLevelTarget, setTestLevelTarget] = useState('beginner');
  const [testDayTarget, setTestDayTarget] = useState(1);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null); // Store full user if needed
  const [userRank, setUserRank] = useState<number | null>(null); // User's leaderboard rank
  const [loadingOpponent, setLoadingOpponent] = useState(false);
  const [matchedOpponent, setMatchedOpponent] = useState<any>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [currentWorkoutName, setCurrentWorkoutName] = useState<string | null>(null);

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

  const showDailyKickstartDetails = async (testLevel?: string, testDay?: number) => {
    try {
      const onboardingData = await OnboardingService.getOnboardingData();
      let level = testLevel || onboardingData?.experience || 'beginner';
      level = level.toLowerCase();
      const day = testDay !== undefined ? testDay : new Date().getDay();

      let uiExercises: any[] = [];
      let description = "";

      // Monday (Day 1)
      if (day === 1 || day === 0) {
        if (level === 'intermediate') {
          if (day === 0) {
            description = "Rest Day";
            uiExercises = [];
          } else {
            description = "Day 1 - Upper Body Strength Day";
            uiExercises = [
              { isHeader: true, title: 'Main Workout' },
              { name: 'Pushups', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Pushups', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Pushups', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },

              { name: 'Tricep Dips', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },

              { name: 'Plank', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            ];
          }
        } else if (level === 'advanced' || level === 'expert') {
          if (day === 0) {
            description = "Rest Day";
            uiExercises = [];
          } else {
            description = "Day 1 - Upper Body Strength Day";
            uiExercises = [
              { isHeader: true, title: 'Main Workout' },
              { name: 'Pushups', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Pushups', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Pushups', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Pushups', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },

              { name: 'Tricep Dips', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },

              { name: 'Plank', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            ];
          }
        } else {
          // Beginner
          if (day === 0) {
            description = "Rest Day";
            uiExercises = [];
          } else {
            description = "Day 1 - Upper Body Strength Day";
            uiExercises = [
              { isHeader: true, title: 'Main Workout' },
              { name: 'Push-up', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
              { name: 'Push-up', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },

              { name: 'Tricep Dips', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },
              { name: 'Tricep Dips', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Tricep_Dips_qywkn3.mp4' },

              { name: 'Plank', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
              { name: 'Plank', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            ];
          }
        }
      }
      // Tuesday (Day 2)
      else if (day === 2) {
        if (level === 'intermediate') {
          description = "Day 2 - Lower Body Builder";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Lunges', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },

            { name: 'Calf Raises', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 2 - Lower Body Builder";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Lunges', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },

            { name: 'Calf Raises', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
          ];
        } else {
          // Beginner (Existing)
          description = "Day 2 - Lower Body Builder";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Lunges', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },
            { name: 'Lunges', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185525/Lunges_cihekd.mp4' },

            { name: 'Calf Raises', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
            { name: 'Calf Raises', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185515/Calf_Raises_mcimrt.mp4' },
          ];
        }
      }
      // Wednesday (Day 3)
      else if (day === 3) {
        if (level === 'intermediate') {
          description = "Day 3 - Core Focus Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Crunches', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },

            { name: 'Leg Raises', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },

            { name: 'Russian Twists', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 3 - Core Focus Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Crunches', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },

            { name: 'Leg Raises', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },

            { name: 'Russian Twists', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
          ];
        } else {
          // Beginner
          description = "Day 3 - Core Focus Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Crunches', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },
            { name: 'Crunches', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185514/Crunches_ywv6ne.mp4' },

            { name: 'Leg Raises', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
            { name: 'Leg Raises', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },

            { name: 'Russian Twists', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
            { name: 'Russian Twists', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185513/Russian_Twists_qlwrwm.mp4' },
          ];
        }
      }
      // Thursday (Day 4)
      else if (day === 4) {
        if (level === 'intermediate') {
          description = "Day 4 - Cardio Burn Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Jumping Jacks', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },

            { name: 'Mountain Climbers', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },

            { name: 'Burpees', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 4 - Cardio Burn Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Jumping Jacks', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },

            { name: 'Mountain Climbers', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },

            { name: 'Burpees', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
          ];
        } else {
          // Beginner
          description = "Day 4 - Cardio Burn Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Jumping Jacks', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },
            { name: 'Jumping Jacks', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185529/Jumping_Jacks_fsd0tu.mp4' },

            { name: 'Mountain Climbers', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },
            { name: 'Mountain Climbers', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185528/Mountain_Climbers_watvuv.mp4' },

            { name: 'Burpees', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
            { name: 'Burpees', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Burpees_yayn8x.mp4' },
          ];
        }
      }
      // Friday (Day 5)
      else if (day === 5) {
        if (level === 'intermediate') {
          description = "Day 5 - Glute & Stability Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Glute Bridge', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },

            { name: 'Step-Ups', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },

            { name: 'Side Plank', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 5 - Glute & Stability Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Glute Bridge', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },

            { name: 'Step-Ups', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },

            { name: 'Side Plank', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },

            { name: 'Pushups', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
            { name: 'Pushups', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
            { name: 'Pushups', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
            { name: 'Pushups', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
          ];
        } else {
          // Beginner
          description = "Day 5 - Glute & Stability Day";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Glute Bridge', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },
            { name: 'Glute Bridge', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185516/Glute_Bridge_nphtwp.mp4' },

            { name: 'Step-Ups', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },
            { name: 'Step-Ups', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185532/Step-Ups_u3mslg.mp4' },

            { name: 'Side Plank', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },
            { name: 'Side Plank', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185518/Side_Plank_bmz6wk.mp4' },

            { name: 'Pushups', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
            { name: 'Pushups', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271652/Pushups_jwsp7a.mp4' },
          ];
        }
      }
      // Saturday (Day 6)
      else if (day === 6) {
        if (level === 'beginner') {
          description = "Day 6 - Full Body Conditioning";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Plank', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },

            { name: 'Mobility (Hamstring)', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },

            { name: 'Hip Rotation', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },

            { name: 'Light Air Squats', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 2 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
          ];
        } else if (level === 'intermediate') {
          description = "Day 6 - Full Body Conditioning";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Plank', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },

            { name: 'Mobility (Hamstring)', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },

            { name: 'Hip Rotation', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },

            { name: 'Light Air Squats', detail: 'Set 1 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 2 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 3 • 40s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
          ];
        } else if (level === 'advanced' || level === 'expert') {
          description = "Day 6 - Full Body Conditioning";
          uiExercises = [
            { isHeader: true, title: 'Main Workout' },
            { name: 'Air Squats', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Air Squats', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },

            { name: 'Plank', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },
            { name: 'Plank', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185533/Plank_riua2q.mp4' },

            { name: 'Mobility (Hamstring)', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
            { name: 'Mobility (Hamstring)', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },

            { name: 'Hip Rotation', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },
            { name: 'Hip Rotation', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185521/Hip_Rotation_pdrbi2.mp4' },

            { name: 'Light Air Squats', detail: 'Set 1 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 2 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 3 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
            { name: 'Light Air Squats', detail: 'Set 4 • 50s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772271653/Squats_cgdiao.mp4' },
          ];
        }
      }



      setSelectedWorkout({
        id: 'DailyKickstart',
        title: 'Warmup',
        description: description,
        time: uiExercises.length === 0 ? 'Rest Day' :
          (level === 'beginner' && (day === 1 || day === 0 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? '6 min' :
            ((level === 'intermediate' && (day === 1 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? '9 min' :
              ((level === 'advanced' || level === 'expert') && (day === 6)) ? '22 min' :
                ((level === 'advanced' || level === 'expert') && (day === 5)) ? '17 min' :
                  ((level === 'advanced' || level === 'expert') && (day === 1 || day === 2 || day === 3 || day === 4)) ? '13 min' : '10 min'),
        tag: `${uiExercises.filter(ex => !ex.isHeader).length} Exercises`,
        category: 'Daily',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        exercises: uiExercises,
        exerciseDuration: (level === 'beginner' && (day === 1 || day === 0 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? 30 :
          ((level === 'intermediate' && (day === 1 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? 40 :
            ((level === 'advanced' || level === 'expert') && (day === 1 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? 50 : 90),
        restDuration: (level === 'beginner' && (day === 1 || day === 0 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? 30 :
          ((level === 'advanced' || level === 'expert') && (day === 1 || day === 2 || day === 3 || day === 4 || day === 5 || day === 6)) ? 15 : 20,
      });

    } catch (e) {
      console.error('Error showing daily details', e);
    }
  };

  const openTestMenu = () => {
    setShowTestMenu(true);
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
        1: 'Upper Body Strength Day',
        2: 'Lower Body Builder',
        3: 'Core Focus Day',
        4: 'Cardio Burn Day',
        5: 'Glute & Stability Day',
        6: 'Full Body Conditioning',
        0: 'Rest Day',
      },
      'Intermediate': {
        1: 'Upper Body Strength Day',
        2: 'Lower Body Builder',
        3: 'Core Focus Day',
        4: 'Cardio Burn Day',
        5: 'Glute & Stability Day',
        6: 'Full Body Conditioning',
        0: 'Rest Day',
      },
      'Expert': {
        1: 'Upper Body Strength Day',
        2: 'Lower Body Builder',
        3: 'Core Focus Day',
        4: 'Cardio Burn Day',
        5: 'Glute & Stability Day',
        6: 'Full Body Conditioning',
        0: 'Rest Day',
      },
      'Advanced': {
        1: 'Upper Body Strength Day',
        2: 'Lower Body Builder',
        3: 'Core Focus Day',
        4: 'Cardio Burn Day',
        5: 'Glute & Stability Day',
        6: 'Full Body Conditioning',
        0: 'Rest Day',
      },
    };

    return workoutDescriptions[experienceLevel]?.[dayOfWeek] || 'Quick 5-minute routine';
  };

  const getDailyMeditationDetails = () => {
    const dayOfWeek = new Date().getDay();
    const onboardingData = user?.onboardingData || {};
    const level = onboardingData.experience?.toLowerCase() || 'beginner';

    const durations: any = {
      'beginner': { long: '40s', short: '35s', display: '12 min' },
      'intermediate': { long: '50s', short: '45s', display: '15 min' },
      'advanced': { long: '60s', short: '55s', display: '18 min' },
      'expert': { long: '60s', short: '55s', display: '18 min' }
    };
    const d = durations[level] || durations.beginner;

    if (dayOfWeek === 2) {
      return {
        id: 'YogaDay2',
        title: 'Yoga Day 2 - Hip Opening Flow',
        description: 'Inner thighs + Glutes',
        time: d.display,
        exercises: [
          { name: 'Baddha Konasana', detail: `${d.long}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
          { name: 'Supta Kapotasana (Left)', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Supta_Kapotasana_k57xyr.mp4' },
          { name: 'Supta Kapotasana (Right)', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Supta_Kapotasana_k57xyr.mp4' },
          { name: 'Parsva Janu Sirsasana', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
        ]
      };
    }

    if (dayOfWeek === 3) {
      const pDetail = `${parseInt(d.short) - 5}s`;
      return {
        id: 'YogaDay3',
        title: 'Yoga Day 3 - Strength & Balance',
        description: 'Core + Stability',
        time: d.display,
        exercises: [
          { name: 'Parivrtta Parsvakonasana', detail: pDetail, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185591/Yoga_-_ustrasana_ruoegj.mp4' }, // Placeholder
          { name: 'Downward Facing Dog', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Downward_Facing_Dog_Adho_Mukha_Svanasana_pbmmtu.mp4' },
          { name: 'Prasarita Padottanasana D', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
        ]
      };
    }

    if (dayOfWeek === 4) {
      const uDetail = `${parseInt(d.short) - 10}s`;
      return {
        id: 'YogaDay4',
        title: 'Yoga Day 4 - Chest & Back Opening',
        description: 'Posture + Spinal Extension',
        time: d.display,
        exercises: [
          { name: 'Ustrasana', detail: uDetail, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185591/Yoga_-_ustrasana_ruoegj.mp4' },
          { name: 'Downward Facing Dog', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Downward_Facing_Dog_Adho_Mukha_Svanasana_pbmmtu.mp4' },
          { name: 'Janu Shirshasana', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
        ]
      };
    }

    if (dayOfWeek === 5) {
      return {
        id: 'YogaDay5',
        title: 'Yoga Day 5 - Deep Stretch & Recovery',
        description: 'Full body mobility',
        time: d.display,
        exercises: [
          { name: 'Prasarita Padottanasana', detail: `${d.long}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
          { name: 'Supta Kapotasana', detail: `${d.short}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Supta_Kapotasana_k57xyr.mp4' },
          { name: 'Baddha Konasana', detail: `${d.long}`, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
        ]
      };
    }

    if (dayOfWeek === 6) {
      const satDurations: any = {
        'beginner': { suk: '3 min', pra: '2 min', lot: '1 min', display: '10 min' },
        'intermediate': { suk: '5 min', pra: '4 min', lot: '3 min', display: '15 min' },
        'advanced': { suk: '8 min', pra: '5 min', lot: '5 min', display: '25 min' },
        'expert': { suk: '8 min', pra: '5 min', lot: '5 min', display: '25 min' }
      };
      const sd = satDurations[level] || satDurations.beginner;
      return {
        id: 'YogaDay6',
        title: 'Yoga Day 6 - Mind & Breath Reset',
        description: 'Nervous system + Meditation',
        time: sd.display,
        exercises: [
          { name: 'Sukhasana (Meditation)', detail: sd.suk, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185593/Meditation_-_Sukhasana_gnlmbp.mp4' },
          { name: 'Pranayama', detail: sd.pra, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185593/Meditation_-_Sukhasana_gnlmbp.mp4' },
          { name: 'Lotus Pose (Padmasana)', detail: sd.lot, videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
        ]
      };
    }

    // Default to Day 1 / Monday
    return {
      id: 'YogaDay1',
      title: 'Yoga Day 1 - Flexibility Foundation',
      description: 'Hamstrings + Spine Lengthening',
      time: '12 min',
      exercises: [
        { name: 'Prasarita Padottanasana', detail: '35s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185588/Yoga_-_baddha_konasana_ydoy05.mp4' },
        { name: 'Janu Shirshasana (Left)', detail: '35s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
        { name: 'Janu Shirshasana (Right)', detail: '35s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185530/Mobility_hamstring_a4sig8.mp4' },
        { name: 'Downward Facing Dog', detail: '35s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185587/Yoga_-_Downward_Facing_Dog_Adho_Mukha_Svanasana_pbmmtu.mp4' },
      ]
    };
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
                  <Text style={{ fontSize: responsive.rf(32), fontWeight: '900', color: '#FFFFFF', fontFamily: 'Arthlete', letterSpacing: 1.5, textTransform: 'uppercase' }}>Arthlete</Text>
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
                        <Text style={{
                          fontSize: 11,
                          color: '#8E8E93',
                          fontFamily: 'Lexend',
                          fontWeight: Platform.OS === 'android' ? 'bold' : '700',
                          marginBottom: 8,
                          letterSpacing: 1
                        }}>
                          PROGRAM DAY {new Date().getDay() || 7} OF 28
                        </Text>
                        <Text style={{
                          fontSize: responsive.rf(26),
                          fontWeight: Platform.OS === 'android' ? '900' : '800',
                          color: '#1C1C1E',
                          fontFamily: 'Lexend',
                          lineHeight: 30,
                          textTransform: 'uppercase',
                          letterSpacing: -0.5,
                        }}>
                          {getDailyWorkoutDescription()}{'\n'}Program
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
                        <Image
                          source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/dumbbell.png' }}
                          style={{ width: 36, height: 36, tintColor: '#FF6B35', zIndex: 10 }}
                          resizeMode="contain"
                          fadeDuration={0}
                        />
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 20 }} />

                    {/* Session rows */}
                    {[
                      { name: 'Warmup', duration: '10 min' },
                      { name: getDailyWorkoutDescription(), duration: '20 min' },
                    ].map((session, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (isPremium) {
                            if (session.name === 'Warmup') {
                              setCurrentWorkoutName('Warmup');
                              navigation.navigate('VideoWorkout', {
                                workout: {
                                  title: 'Warmup',
                                  exercises: [
                                    { isHeader: true, title: 'Warm-up' },
                                    { name: 'Standing Knee Raise', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185582/warm_up-_standing_knee_raise_iodwnw.mp4' },
                                    { name: 'Kickup Jumping Jacks', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185581/warm_up_-_kick_up_jumping_jacks_ivb6lt.mp4' },
                                    { name: 'Wrist Circles', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185584/Warm_up_-_Wrist_Circles_vgj6vg.mp4' },
                                    { name: 'Knee Rotations', detail: 'Set 1 • 30s', videoUrl: 'https://res.cloudinary.com/dzszfujpk/video/upload/v1772185581/warm_up_-_knee_rotations_dzrjqs.mp4' }
                                  ]
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
                          <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6B35/play--v1.png' }}
                            style={{ width: 14, height: 14 }}
                            resizeMode="contain"
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </TouchableOpacity>

                  {/* ── Today's Meditation Card ── */}
                  <TouchableOpacity
                    activeOpacity={0.97}
                    onPress={() => {
                      if (isPremium) {
                        const details = getDailyMeditationDetails();
                        if (details) {
                          setSelectedWorkout(details);
                        }
                      } else {
                        setShowPremiumModal(true);
                      }
                    }}
                    style={{
                      marginHorizontal: 16,
                      backgroundColor: '#F8FBFF', // Subtle blue tint like screenshot
                      borderRadius: 18,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 2,
                      marginBottom: 24,
                      padding: 24, // More padding like screenshot
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: '#EBF3FF',
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, color: '#3A86FF', fontFamily: 'Lexend', fontWeight: Platform.OS === 'android' ? 'bold' : '700', marginBottom: 6, letterSpacing: 0.5 }}>
                        TODAY'S MINDFULNESS
                      </Text>
                      <Text style={{ fontSize: 19, fontWeight: Platform.OS === 'android' ? '900' : '800', color: '#1C1C1E', fontFamily: 'Lexend', marginBottom: 4 }}>
                        {getDailyMeditationDetails().title}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#8E8E93', fontFamily: 'Lexend' }}>
                        {getDailyMeditationDetails().description} • {getDailyMeditationDetails().time}
                      </Text>
                    </View>
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E1EFFF', justifyContent: 'center', alignItems: 'center' }}>
                      <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/yoga.png' }}
                        style={{ width: 32, height: 32, tintColor: '#3A86FF', zIndex: 10 }}
                        resizeMode="contain"
                        fadeDuration={0}
                      />
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
                      { id: 'CardioCrusher', title: 'Cardio Crusher', tag: 'New · 6 sessions', author: 'Coach Sarah', img: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=400&q=80', icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/running.png' },
                      { id: 'FatBurnHIIT', title: 'Fat Burn HIIT', tag: 'HIIT · 4 sessions', author: 'Coach Sarah', img: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=400&q=80', icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/fire-element.png' },
                      { id: 'Shoulders', title: 'Shoulder Builder', tag: 'Strength · 6 sessions', author: 'Coach Alex', img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80', icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/dumbbell.png' },
                      { id: 'LowerBody', title: 'Leg Day Special', tag: 'Lower · 5 sessions', author: 'Coach Laura', img: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=80', icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/squats.png' },
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

                  {/* ── Test Mode / Preview ── */}
                  <TouchableOpacity
                    onPress={openTestMenu}
                    style={{ backgroundColor: '#2C2C2E', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center' }}
                  >
                    <Text style={{ color: 'white', fontFamily: 'Lexend', fontSize: 13, fontWeight: '700' }}>TEST WORKOUTS</Text>
                  </TouchableOpacity>

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
                        { name: 'Arms', image: 'https://img.icons8.com/ios-filled/50/ffffff/biceps.png', color: '#F2F2F7' },
                        { name: 'Chest', image: 'https://img.icons8.com/ios-filled/50/ffffff/chest.png', color: '#F2F2F7' },
                        { name: 'Back', image: 'https://img.icons8.com/ios-filled/50/ffffff/back-muscles.png', color: '#F2F2F7' },
                        { name: 'Shoulders', image: 'https://img.icons8.com/ios-filled/50/ffffff/shoulders.png', color: '#F2F2F7' },
                        { name: 'Legs', image: 'https://img.icons8.com/ios-filled/50/ffffff/leg.png', color: '#F2F2F7' },
                        { name: 'Abs', image: 'https://img.icons8.com/ios-filled/50/ffffff/torso.png', color: '#F2F2F7' },
                        { name: 'Thighs', image: 'https://img.icons8.com/ios-filled/50/ffffff/hamstrings.png', color: '#F2F2F7' },
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
                  <Text style={{ fontSize: responsive.rf(32), fontWeight: '900', color: '#FFFFFF', fontFamily: 'Arthlete', letterSpacing: 1.5, textTransform: 'uppercase' }}>Progress</Text>
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
                  <Text style={{ fontSize: responsive.rf(32), fontWeight: '900', color: '#FFFFFF', fontFamily: 'Arthlete', letterSpacing: 1.5, textTransform: 'uppercase' }}>Profile</Text>
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
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/fire-element.png' }}
                        style={{ width: 24, height: 24, marginRight: 8, tintColor: '#FFD700' }}
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
          {/* TEST MENU MODAL */}
          <Modal visible={showTestMenu} animationType="fade" transparent={true}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={{ backgroundColor: '#1C1C1E', borderRadius: 24, padding: 24, width: '100%' }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', fontFamily: 'Lexend', marginBottom: 24, textAlign: 'center' }}>Test Mode</Text>

                <Text style={{ color: '#8E8E93', fontSize: 14, fontFamily: 'Lexend', marginBottom: 12 }}>Select Level</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                    <TouchableOpacity key={l} onPress={() => setTestLevelTarget(l.toLowerCase())}
                      style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: testLevelTarget === l.toLowerCase() ? '#FF6B35' : '#2C2C2E' }}>
                      <Text style={{ color: 'white', fontSize: 12, fontFamily: 'Lexend', fontWeight: testLevelTarget === l.toLowerCase() ? '700' : '400' }}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ color: '#8E8E93', fontSize: 14, fontFamily: 'Lexend', marginBottom: 12 }}>Select Day</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <TouchableOpacity key={d} onPress={() => setTestDayTarget(d)}
                      style={{ height: 44, width: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: testDayTarget === d ? '#FF6B35' : '#2C2C2E' }}>
                      <Text style={{ color: 'white', fontSize: 15, fontFamily: 'Lexend', fontWeight: testDayTarget === d ? '700' : '400' }}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={() => setShowTestMenu(false)}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#2C2C2E', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Lexend', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setShowTestMenu(false); showDailyKickstartDetails(testLevelTarget, testDayTarget); }}
                    style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#FF6B35', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Lexend', fontWeight: '800' }}>Load</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
                            <Text style={{ fontSize: 12, color: '#FFF', fontFamily: 'Lexend' }}>PRO {matchedOpponent.credits}</Text>
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
                        iconUrl = 'https://img.icons8.com/ios-filled/50/ffffff/fire-element.png';
                        cleanTitle = 'Warm-up';
                      } else if (ex.title.includes('Main Workout')) {
                        iconUrl = 'https://img.icons8.com/ios-filled/50/ffffff/trophy.png';
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
                  {selectedWorkout ? (
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
                        const workoutToPlay = selectedWorkout; // capture BEFORE clearing
                        if (workoutToPlay) {
                          setCurrentWorkoutName(workoutToPlay.title);
                        }
                        setSelectedWorkout(null);
                        setTimeout(() => {
                          navigation.navigate('VideoWorkout', { workout: workoutToPlay });
                        }, 300);
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