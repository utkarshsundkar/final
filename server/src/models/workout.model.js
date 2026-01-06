import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workout_name: {
            type: String,
            required: true,
        },
        total_exercises: {
            type: Number,
            default: 0,
        },
        perfect_exercises: {
            type: Number,
            default: 0,
        },
        is_perfect: {
            type: Boolean,
            default: false,
        },
        duration_seconds: {
            type: Number,
            default: 0,
        },
        exercises: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise",
        }],
    },
    { timestamps: true }
);

const Workout = mongoose.model("Workout", workoutSchema);

export default Workout;
