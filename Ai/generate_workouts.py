"""
Workout Generator - Creates 3-set workout structures
This script generates the code for all workout handlers with 3 sets, 60s exercises, and 90s rest.
"""

# Define all workouts with their exercises
workouts = {
    'ArmsProgram': {
        'title': 'Arms Program',
        'description': 'Increase weights gradually for arm strength',
        'zone': 'UpperBody',
        'exercises': [
            ('Shoulder Press', 'ShouldersPress'),
            ('Push-ups', 'PushupRegular'),
            ('Shoulder Taps Plank', 'PlankHighShoulderTaps')
        ]
    },
    'LegsProgram': {
        'title': 'Legs Program',
        'description': 'Build strength and endurance in your legs',
        'zone': 'LowerBody',
        'exercises': [
            ('Air Squat', 'SquatRegular'),
            ('Lunge', 'LungeFrontRight'),
            ('Glutes Bridge', 'GlutesBridge'),
            ('Side Lunge Left', 'SideLungeLeft'),
            ('Side Lunge Right', 'SideLungeRight')
        ]
    },
    'UpperBodyStrength': {
        'title': 'Upper Body Strength',
        'description': 'Focus on Upper Body strength and definition',
        'zone': 'UpperBody',
        'exercises': [
            ('Push-ups', 'PushupRegular'),
            ('Shoulder Press', 'ShouldersPress'),
            ('Shoulder Taps Plank', 'PlankHighShoulderTaps')
        ]
    },
    'FullBodyBuilder': {
        'title': 'Full-Body Builder',
        'description': 'Complete full body workout',
        'zone': 'FullBody',
        'exercises': [
            ('Air Squat', 'SquatRegular'),
            ('Push-ups', 'PushupRegular'),
            ('Overhead Squat', 'SquatOverhead')
        ]
    }
}

print("=== GENERATED WORKOUT HANDLERS ===\n")
print("Copy the code below and replace the existing workout handlers in App.tsx\n")
print("="*80)

for workout_id, workout_data in workouts.items():
    print(f"\n      }} else if (type === '{workout_id}') {{")
    print(f"        console.log('{workout_id} workout block reached');")
    print(f"        // {workout_data['title']} - 3 sets with rest")
    print(f"        const {workout_id.lower()}Exercises = [];")
    print()
    
    for set_num in range(1, 4):  # 3 sets
        print(f"        // Set {set_num}")
        print(f"        {workout_id.lower()}Exercises.push(")
        
        for idx, (exercise_name, exercise_id) in enumerate(workout_data['exercises']):
            print(f"          new SMWorkoutLibrary.SMExercise(")
            print(f"            '{exercise_name} - Set {set_num}', 60, '{exercise_id}', null,")
            print(f"            [SMWorkoutLibrary.UIElement.RepsCounter, SMWorkoutLibrary.UIElement.Timer], '{exercise_id}', '',")
            print(f"            new SMWorkoutLibrary.SMScoringParams(SMWorkoutLibrary.ScoringType.Time, threshold, null, 60, null, null)")
            print(f"          ),")
            
            # Add rest after each exercise except the last one in the set
            if idx < len(workout_data['exercises']) - 1:
                print(f"          new SMWorkoutLibrary.SMExercise(")
                print(f"            'Rest', 90, 'Rest', null,")
                print(f"            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',")
                print(f"            new SMWorkoutLibrary.SMScoringParams(SMWorkoutLibrary.ScoringType.Time, threshold, null, 90, null, null)")
                print(f"          ),")
        
        # Add rest between sets (except after the last set)
        if set_num < 3:
            print(f"          new SMWorkoutLibrary.SMExercise(")
            print(f"            'Rest', 90, 'Rest', null,")
            print(f"            [SMWorkoutLibrary.UIElement.Timer], 'Rest', '',")
            print(f"            new SMWorkoutLibrary.SMScoringParams(SMWorkoutLibrary.ScoringType.Time, threshold, null, 90, null, null)")
            print(f"          )")
        
        print(f"        );")
        print()
    
    print(f"        const {workout_id.lower()}Workout = new SMWorkoutLibrary.SMWorkout(")
    print(f"          '{workout_id}', '{workout_data['title']}', '{workout_data['description']}',")
    print(f"          SMWorkoutLibrary.BodyZone.{workout_data['zone']}, {workout_id.lower()}Exercises,")
    print(f"          SMWorkoutLibrary.WorkoutDifficulty.LowDifficulty, SMWorkoutLibrary.WorkoutDuration.Long, null")
    print(f"        );")
    print()
    print(f"        console.log('About to call startCustomWorkout with workout:', {workout_id.lower()}Workout);")
    print(f"        try {{")
    print(f"          try {{")
    print(f"            await exitWorkout();")
    print(f"            console.log('Exited any previous workout session');")
    print(f"          }} catch (e) {{")
    print(f"            console.log('No previous workout to exit or exit failed:', e);")
    print(f"          }}")
    print()
    print(f"          const result = await startCustomWorkout({workout_id.lower()}Workout, null, true, false);")
    print(f"          console.log('startCustomWorkout returned:', result);")
    print(f"          if (result) {{")
    print(f"            handleWorkoutCompletion({{ summary: result }});")
    print(f"          }}")
    print(f"        }} catch (error) {{")
    print(f"          console.error('Error in startCustomWorkout:', error);")
    print(f"          Alert.alert('Workout Error', `Failed to start workout: ${{error}}`);")
    print(f"        }}")

print("\n" + "="*80)
print("\nNOTE: This generates the workout handlers for Strength category.")
print("Similar code needs to be generated for Cardio, Core, Mobility, and Lower categories.")
