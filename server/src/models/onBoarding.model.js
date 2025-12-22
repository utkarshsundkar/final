import mongoose from "mongoose";
import { User } from "./user.model.js"; // Assuming you have a User model
const onboardingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: false,
    },
    height: {
      type: Number, // Assuming height in cm or inches
      required: false,
      min: [50, "Height must be at least 50 cm"],
      max: [300, "Height cannot exceed 300 cm"],
    },
    weight: {
      type: Number, // Assuming weight in kg or lbs
      required: false,
      min: [30, "Weight must be at least 30 kg"],
      max: [500, "Weight cannot exceed 500 kg"],
    },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "male", "female"],
    },
    primaryGoal: {
      type: String,
      required: false,
      enum: ["weight loss", "muscle gain", "maintain", "lose", "muscle", "fit", "endurance"],
    },
    workoutFrequency: {
      type: String, // Number of days per week, etc.
      required: false,
    },
    currentFitnessLevel: {
      type: String,
      required: false,
      enum: ["beginner", "intermediate", "advanced"],
    },
    dailyActivityLevel: {
      type: String,
      required: false,
      enum: ["Low", "Moderate", "High", "sedentary", "light", "moderate", "very"],
    },
    securityQuestions: {
      type: String,
      required: false,
      enum: [
        "What is your mother's maiden name?",
        "What was the name of your first pet?",
        "What was the name of your elementary school?",
        "What is your favorite food?",
      ],
    },

    securityQuestionsAnswer: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Onboarding = mongoose.model("Onboarding", onboardingSchema);
export default Onboarding;
