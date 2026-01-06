import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const workoutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workout_name: { type: String, required: true },
    total_exercises: { type: Number, default: 0 },
    perfect_exercises: { type: Number, default: 0 },
    is_perfect: { type: Boolean, default: false },
    duration_seconds: { type: Number, default: 0 },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
}, { timestamps: true });

const Workout = mongoose.model("Workout", workoutSchema);

const workoutNames = [
    'DailyKickstart',
    'CardioCrusher',
    'AbsReloaded',
    'PowerSquad',
    'UpperBodyBlast',
    'LegDay',
    'CoreCrusher',
    'HIITBurn',
    'MobilityFlow',
    'GluteFocus',
    'PlankChallenge',
    'CardioMax',
    'SweatCircuit'
];

async function addTestData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected!');

        // Create a dummy user ID (you can replace with a real user ID if needed)
        const dummyUserId = new mongoose.Types.ObjectId();

        console.log('Adding test workout completions...');

        for (const workoutName of workoutNames) {
            // Add 1 attempt (not perfect)
            await Workout.create({
                userId: dummyUserId,
                workout_name: workoutName,
                total_exercises: 5,
                perfect_exercises: 3,
                is_perfect: false,
                duration_seconds: 300
            });

            console.log(`✓ Added 1 attempt for ${workoutName}`);
        }

        console.log('\n✅ Test data added successfully!');
        console.log('Reload your app to see the stats.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addTestData();
