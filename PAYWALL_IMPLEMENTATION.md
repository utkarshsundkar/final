# Paywall Implementation Guide for App.tsx

## Step 1: Add Imports (at top of file, around line 60)

```typescript
import PaywallModal from './src/components/PaywallModal';
import PremiumModal from './src/screens/PremiumModal';
import { checkIsPremium } from './src/hooks/usePremiumStatus';
```

## Step 2: Add State Variables (around line 800, with other useState declarations)

```typescript
// Paywall states
const [showPaywall, setShowPaywall] = useState(false);
const [showPremiumModal, setShowPremiumModal] = useState(false);
const [paywallFeature, setPaywallFeature] = useState('this workout');
```

## Step 3: Update Start Workout Button (around line 3413-3421)

Replace the current onPress handler:

```typescript
onPress={async () => {
  // Check premium status before starting workout
  const isPremium = await checkIsPremium();
  
  if (!isPremium) {
    // Show paywall for non-premium users
    setPaywallFeature(selectedWorkout?.title || 'this workout');
    setShowPaywall(true);
    return;
  }
  
  // Premium user - proceed with workout
  const id = selectedWorkout?.id;
  setSelectedWorkout(null);
  setTimeout(() => {
    console.log('Starting workout:', id);
    startChallenge(id);
  }, 600);
}}
```

## Step 4: Add Paywall Modal (before closing return statement, around line 3900)

```tsx
{/* Paywall Modal */}
<PaywallModal
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onUpgrade={() => {
    setShowPaywall(false);
    setShowPremiumModal(true);
  }}
  feature={paywallFeature}
/>

{/* Premium Modal */}
<PremiumModal
  visible={showPremiumModal}
  onClose={() => setShowPremiumModal(false)}
  userEmail={user?.email || ''}
  userName={user?.name || user?.username || ''}
/>
```

## Step 5: Apply Same Logic to All Workout Cards

For each workout card in the "Active" and "Workouts" tabs, wrap the onPress with premium check:

### Example for Active Tab Workouts (around line 2200-2400):

```typescript
onPress={async () => {
  const isPremium = await checkIsPremium();
  
  if (!isPremium) {
    setPaywallFeature(workout.title);
    setShowPaywall(true);
    return;
  }
  
  // Show workout details for premium users
  setSelectedWorkout(WORKOUT_DETAILS_DATA[workout.id]);
}}
```

### Example for Workouts Tab Cards (around line 2600-2800):

```typescript
onPress={async () => {
  const isPremium = await checkIsPremium();
  
  if (!isPremium) {
    setPaywallFeature(workout.title);
    setShowPaywall(true);
    return;
  }
  
  // Show workout details for premium users
  setSelectedWorkout(WORKOUT_DETAILS_DATA[workout.id]);
}}
```

## Complete Flow:

1. **User clicks workout card** → Premium check
2. **If NOT premium** → Show Paywall Modal
3. **User clicks "Upgrade to Premium"** → Show Premium Modal (pricing)
4. **User completes payment** → Premium status updated
5. **User can now access workouts** → Workout details shown
6. **User clicks "Start Workout"** → Another premium check
7. **If premium** → Workout starts via Sency SDK

## Testing:

1. **Test as non-premium user:**
   - Click any workout card
   - Should see Paywall Modal
   - Click "Upgrade to Premium"
   - Should see Premium Modal with pricing

2. **Test as premium user:**
   - Click any workout card
   - Should see workout details directly
   - Click "Start Workout"
   - Workout should start

## Notes:

- Premium check happens at TWO points:
  1. When clicking workout card (shows details)
  2. When clicking "Start Workout" button (starts workout)
  
- This ensures even if someone bypasses the first check, they can't start the workout without premium

- The paywall is beautiful and engaging, encouraging upgrades

- Premium status is checked from backend in real-time
