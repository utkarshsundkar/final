import FocusSession from "../models/focusSession.model.js";
import mongoose from "mongoose";
import Exercise from "../models/exercise.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startFocusSession = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new ApiError(400, "User ID is required.");

  const newSession = await FocusSession.create({ userId });

  // Optionally, add session ID to user
  await User.findByIdAndUpdate(userId, {
    $push: { focusSessions: newSession._id }, // Push to session history
    $set: { currentFocusSession: newSession._id }, // Set current session
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newSession, "Focus session started."));
});

//===================================

export const endFocusSession = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new ApiError(400, "User ID is required.");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId)
      .populate({
        path: "currentFocusSession",
        populate: {
          path: "exercises",
          model: "Exercise",
          select: "_id reps_performed_perfect credit_claimed",
        },
      })
      .session(session);

    if (!user?.currentFocusSession) {
      throw new ApiError(404, "Focus session not found.");
    }

    const focusSession = user.currentFocusSession;

    // ✅ Calculate total credits to add
    const creditsToAdd = focusSession.exercises.reduce((total, exercise) => {
      return total + (exercise.reps_performed_perfect || 0) * 2; // 2x for perfect reps in focus mode
    }, 0);

    // ✅ Add to user credits
    if (creditsToAdd > 0) {
      user.credits += creditsToAdd;
    }

    // ✅ Mark each exercise's credit as claimed
    const exerciseIds = focusSession.exercises.map((ex) => ex._id);

    await Exercise.updateMany(
      { _id: { $in: exerciseIds } },
      { $set: { credit_claimed: true } },
      { session } // Ensure it runs within the transaction
    );

    // ✅ Finalize session
    focusSession.endTime = new Date();
    focusSession.isCompleted = true;
    focusSession.creditsAdded = creditsToAdd;

    user.currentFocusSession = undefined;

    await focusSession.save({ session });
    await user.save({ session });

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          focusSession,
          updatedCredits: user.credits,
        },
        creditsToAdd > 0
          ? `${creditsToAdd} credits added based on perfect reps.`
          : "No credits added. Try to perform perfect reps next time!"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

//===================================

export const checkAndFinalizePreviousFocusSession = asyncHandler(
  async (req, res) => {
    const { userId } = req.body;

    if (!userId) throw new ApiError(400, "User ID is required.");

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Step 1: Fetch user with populated currentFocusSession and exercises
      const user = await User.findById(userId)
        .populate({
          path: "currentFocusSession",
          populate: {
            path: "exercises",
            model: "Exercise",
            select: "_id reps_performed reps_performed_perfect status",
          },
        })
        .session(session);

      const focusSession = user?.currentFocusSession;

      // Step 2: If no active session or already completed, exit early
      if (!focusSession || focusSession.isCompleted) {
        await session.commitTransaction();
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "No previous session to finalize."));
      }

      // Step 3: Calculate imperfect reps
       const creditsToDeduct = focusSession.imperfectReps * 2;

      // Step 4: Deduct credits from user if needed
      if (creditsToDeduct > 0) {
        user.credits -= creditsToDeduct;
      }

      // ✅ Step 5: Set all exercises' status to true
      const exerciseIds = focusSession.exercises.map((ex) => ex._id);

      await Exercise.updateMany(
        { _id: { $in: exerciseIds } },
        { $set: { status: true } },
        { session }
      );

      // Step 6: Finalize session
      focusSession.endTime = new Date();
      focusSession.isCompleted = true;
      focusSession.creditsDeducted = creditsToDeduct;
      user.currentFocusSession = undefined;

      // Save documents
      await focusSession.save({ session });
      await user.save({ session });

      await session.commitTransaction();

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            focusSession,
            remainingCredits: user.credits,
          },
          creditsToDeduct > 0
            ? `${creditsToDeduct} credits were deducted from unfinished session.`
            : "Previous session finalized with no deductions."
        )
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);
