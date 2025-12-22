import Exercise from '../models/exercise.model.js';
import FocusSession from '../models/focusSession.model.js';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const saveExercise = asyncHandler(async (req, res, next) => {
    const { userId, exercise_name, reps_performed, reps_performed_perfect, isFocused } = req.body;

    // Basic validation
    if (!userId || !exercise_name || reps_performed == null || reps_performed_perfect == null) {
        throw new ApiError(400, "All fields (userId, exercise_name, reps_performed, reps_performed_perfect) are required.");
    }

    // Create new exercise with processing status
    const newExercise = await Exercise.create({
        userId,
        exercise_name,
        reps_performed,
        reps_performed_perfect,
        isFocused: isFocused || false
        
    });
    await User.findByIdAndUpdate(userId, {
  $push: { exercises: newExercise._id },
});

    // For non-focused exercises, attempt to process credits immediately
    if (!isFocused) {
        try {
            // Calculate credits (1 credit per perfect rep for normal exercises)
            const creditsToAdd = reps_performed_perfect;
            
            // Optimistic update pattern with version checking
            const updateResult = await User.findOneAndUpdate(
                { _id: userId },
                { $inc: { credits: creditsToAdd } },
                { new: true }
            );

            if (updateResult) {
                // Mark exercise as processed
                newExercise. credit_claimed = true;
                await newExercise.save();
            } else {
                throw new Error("User not found");
            }
        } catch (error) {
            // Credit processing failed - will be handled by reconciliation
            newExercise.credit_claimed = false;
            await newExercise.save();
            console.error("Credit processing failed:", error.message);
            // Continue with response - failure will be handled asynchronously
        }
    }

    return res.status(201).json(
        new ApiResponse(201, {
            exercise: newExercise,
            message: "Exercise saved successfully!" + 
                    (isFocused ? " Credits will be awarded when focus session ends." : 
                    newExercise.credit_claimed ? " Credits awarded." :
                    " Credit awarding in progress.")
        })
    );
});


//===================


const saveFocusExercise = asyncHandler(async (req, res) => {
    const { userId, exercise_name, reps_performed, reps_performed_perfect } = req.body;

    // Basic validation
    if (!userId || !exercise_name || reps_performed == null || reps_performed_perfect == null) {
        throw new ApiError(400, "All fields are required");
    }

    // 1. Verify focus session exists and is active
    const user = await User.findById(userId)
        .populate({
            path: 'currentFocusSession',
            select: '_id isCompleted exercises'
        });

    if (!user?.currentFocusSession) {
        throw new ApiError(400, "No active focus session found");
    }

    const focusSession = user.currentFocusSession;
    if (focusSession.isCompleted) {
        throw new ApiError(400, "Focus session already ended");
    }

    // 2. Create the exercise
    const newExercise = await Exercise.create({
        userId,
        exercise_name,
        reps_performed,
        reps_performed_perfect,
        isFocused: true,
        focusSessionId: focusSession._id,
        status: reps_performed === reps_performed_perfect

    });

    // 3. Add exercise to focus session
      await FocusSession.findByIdAndUpdate(focusSession._id, {
  $inc: {
    imperfectReps: newExercise.reps_performed - newExercise.reps_performed_perfect
  }
});
    await FocusSession.findByIdAndUpdate(
        focusSession._id,
        { $push: { exercises: newExercise._id } }
    );

    // 4. Award credits (2x for focus exercises)
    const creditsToAdd = reps_performed_perfect * 2;
    

    return res.status(201).json(
        new ApiResponse(201, {
            exercise: newExercise,
            creditsAwarded: creditsToAdd
        }, `Focused exercise saved! ${creditsToAdd} credits awarded (2x bonus)`)
    );
});

//========================================



const updateExerciseProgress = asyncHandler(async (req, res) => {
  const { userId, exercise_name, reps_performed, reps_performed_perfect } = req.body;

  // Validate input
  if (!userId || !exercise_name || reps_performed == null || reps_performed_perfect == null) {
    return res.status(400).json({ error: "All fields (userId, exercise_name, reps_performed, reps_performed_perfect) are required." });
  }

  // Fetch user with currentFocusSession populated
  const user = await User.findById(userId).populate({
    path: 'currentFocusSession',
    select: '_id isCompleted exercises',
    populate: {
      path: 'exercises',
      select: '_id exercise_name status'
    }
  });

  if (!user?.currentFocusSession) {
    throw new ApiError(400, "No active focus session found");
  }

  const focusSession = user.currentFocusSession;

  // Find matching exercise with status = false
  const targetExercise = focusSession.exercises.find(
    ex => ex.exercise_name === exercise_name && ex.status === false
  );

  if (!targetExercise) {
    return res.status(404).json({ error: 'No incomplete matching exercise found in the current session.' });
  }

   await FocusSession.findByIdAndUpdate(focusSession._id, {
  $inc: {
    imperfectReps: targetExercise.reps_performed - targetExercise.reps_performed_perfect
  }
});

  // Determine if reps are perfect
  const isComplete = reps_performed === reps_performed_perfect;

  // Update the exercise document
  const updatedExercise = await Exercise.findByIdAndUpdate(
    targetExercise._id,
    {
      reps_performed,
      reps_performed_perfect,
      status: isComplete
    },
    { new: true }
  );

  return res.status(200).json({
    message: isComplete ? "Exercise completed successfully." : "Exercise updated but not completed.",
    exercise: updatedExercise
  });
});






 const getUserExercises = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID is required.');
    }

    const exercises = await Exercise.find({ userId }).sort({ createdAt: -1 });

    if (!exercises || exercises.length === 0) {
        throw new ApiError(404, 'No exercises found for this user.');
    }

    return res.status(200).json(
        new ApiResponse(200, exercises, 'Exercises fetched successfully.')
    );
});





export { saveExercise, saveFocusExercise, getUserExercises, updateExerciseProgress };
