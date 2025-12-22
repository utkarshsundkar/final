import Exercise from '../models/exercise.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const giveNormalCredits = asyncHandler(async (req, res) => {
    const { userId, exercise_name } = req.body;

    if (!userId || !exercise_name) {
        throw new ApiError(400, 'userId and exercise_name are required.');
    }

    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const maxRetries = 5;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
        try {
            // Find the eligible exercise and claim it atomically
            const exercise = await Exercise.findOneAndUpdate(
                {
                    userId,
                    exercise_name,
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    credit_claimed: false
                },
                { $set: { credit_claimed: true } },
                {
                    sort: { createdAt: -1 },
                    new: true,
                    writeConcern: { w: 'majority' }
                }
            );

            if (!exercise) {
                throw new ApiError(404, 'No eligible exercise found for credit claim.');
            }

            // Determine credits to add
            const creditsToAdd = exercise.isFocused
                ? exercise.reps_performed_perfect * 2 // double credits if focused
                : exercise.reps_performed_perfect;    // normal credits if not focused

            let userUpdateSuccess = false;
            let userRetryCount = 0;

            while (!userUpdateSuccess && userRetryCount < 3) {
                try {
                    const updatedUser = await User.findByIdAndUpdate(
                        userId,
                        { $inc: { credits: creditsToAdd } },
                        {
                            new: true,
                            writeConcern: { w: 'majority' }
                        }
                    );

                    userUpdateSuccess = true;

                    return res.status(200).json(
                        new ApiResponse(
                            200,
                            updatedUser,
                            exercise.isFocused
                                ? `Focused exercise! ${creditsToAdd} credits added (2x bonus).`
                                : `${creditsToAdd} credits added successfully.`
                        )
                    );
                } catch (userError) {
                    if (userError.code === 112) { // WriteConflict
                        userRetryCount++;
                        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, userRetryCount)));
                        continue;
                    }
                    throw userError;
                }
            }

            if (!userUpdateSuccess) {
                // Revert exercise claim if user update failed
                await Exercise.findByIdAndUpdate(exercise._id, { $set: { credit_claimed: false } });
                throw new ApiError(500, 'Failed to update user credits after multiple attempts.');
            }

        } catch (error) {
            if (error.code === 112) { // WriteConflict
                retryCount++;
                lastError = error;
                await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount)));
                continue;
            }

            if (error instanceof ApiError) throw error;

            console.error('Credit Processing Error:', error);
            throw new ApiError(500, 'Internal Server Error while processing credit.');
        }
    }

    console.error('Max retries reached for giveCredits:', lastError);
    throw new ApiError(429, 'System busy processing credits. Please try again in a moment.');
});

export const getUserCredits = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, 'User ID is required.');
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, 'User not found.');
    }

    return res.status(200).json(
        new ApiResponse(200, { credits: user.credits }, 'User credits fetched successfully.')
    );
});