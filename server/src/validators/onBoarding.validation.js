import Joi from "joi";

// Define onboarding validation schema
const onboardingSchema = Joi.object({
  userId: Joi.string().optional(),

  age: Joi.number().positive().min(13).max(120).optional().messages({
    "number.base": "Age must be a number.",
    "number.positive": "Age must be a positive number.",
    "number.min": "Age must be at least 13.",
    "number.max": "Age cannot exceed 120.",
  }),

  height: Joi.number().positive().optional().messages({
    "number.base": "Height must be a number.",
    "number.positive": "Height must be a positive number.",
  }),

  weight: Joi.number().positive().optional().messages({
    "number.base": "Weight must be a number.",
    "number.positive": "Weight must be a positive number.",
  }),

  gender: Joi.string().valid("Male", "Female", "male", "female").optional().messages({
    "string.base": "Gender must be a string.",
  }),

  primaryGoal: Joi.string().valid("weight loss", "muscle gain", "maintain", "lose", "muscle", "fit", "endurance").optional().messages({
    "string.base": "Primary goal must be a string.",
    "any.only": "Primary goal must be one of: weight loss, muscle gain, maintain, lose, muscle, fit, endurance.",
  }),

  workoutFrequency: Joi.string().optional().messages({
    "string.base": "Workout frequency must be a string.",
  }),

  currentFitnessLevel: Joi.string().trim().optional().messages({
    "string.base": "Current fitness level must be a string.",
  }),

  dailyActivityLevel: Joi.string()
    .valid("Low", "Moderate", "High", "sedentary", "light", "moderate", "very")
    .optional()
    .messages({
      "string.base": "Daily activity level must be a string.",
    }),
  securityQuestions: Joi.string()
    .valid(
      "What is your mother's maiden name?",
      "What was the name of your first pet?",
      "What was the name of your elementary school?",
      "What is your favorite food?"
    )
    .optional()
    .messages({
      "string.base": "Security question must be a string.",
      "any.only": "Security question must be one of the predefined options.",
    }),

  securityQuestionsAnswer: Joi.string().optional().messages({
    "string.base": "Security question answer must be a string.",
  }),
});

export { onboardingSchema };
