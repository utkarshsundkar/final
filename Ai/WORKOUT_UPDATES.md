# Workout Updates - 3 Set Structure Implementation

This document contains the implementation plan for updating all workout handlers to include 3 sets with 60s exercises and 90s rest periods.

## Status

### ✅ Completed
- ChestProgram (3 exercises, 18 min)
- All card times updated

### 🔄 In Progress
- ArmsProgram
- LegsProgram  
- UpperBodyStrength
- FullBodyBuilder

### ⏳ Pending
- All Cardio workouts (HIITExpress, SweatCircuit, CardioCrusher, CardioMax)
- All Core workouts (CoreCrusher, AbsReloaded)
- All Mobility workouts (MobilityFlow, DynamicMobility)
- All Lower workouts (GluteBlaster, etc.)

## Implementation Notes

Each workout needs to be restructured to:
1. Create an empty exercises array
2. For each of 3 sets:
   - Add all exercises with 60s duration
   - Add 90s rest between exercises (not after the last exercise in each set)
3. Update WorkoutDuration to appropriate value (Short/Long)

## Time Calculations
- 3 exercises: 18 min
- 4 exercises: 24 min
- 5 exercises: 30 min

The pattern from ChestProgram should be replicated for all other workouts.
