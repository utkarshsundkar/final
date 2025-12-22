import { DIY } from '../models/diy.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createDIY = asyncHandler(async (req, res) => {
    const { userId,name , day, exercises } = req.body;

    // Basic validation
    if (!userId || !name || !day || !exercises || exercises.length === 0) {
        throw new ApiError(400, "All fields (userId, name, day, exercises) are required and exercises cannot be empty.");
    }

    // Upsert Logic: Find if DIY exists for this user and day
    const updatedDIY = await DIY.findOneAndUpdate(
        { userId, day }, // Match by user and day
        { name, exercises },    // Replace exercises with new ones
        { new: true, upsert: true, setDefaultsOnInsert: true } // Create if not exists
    );
        // Push _id to user's diy array (only if not already present)
    await User.findByIdAndUpdate(userId, {
        $addToSet: { diy: updatedDIY._id } // $addToSet ensures no duplicates
    });


    return res.status(200).json(
        new ApiResponse(200, updatedDIY, "DIY entry saved successfully (updated or created).")
    );
});

// Get DIY entries by userId
// This endpoint retrieves all DIY entries for a specific user, sorted by day in descending order

export const getDIYByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "userId is required.");
    }

    const diyEntries = await DIY.find({ userId })
        .sort({ day: -1 }) // Sort by day descending
        

    if (!diyEntries || diyEntries.length === 0) {
        return res.status(404).json(new ApiResponse(404, [], "No DIY entries found for this user."));
    }

    return res.status(200).json(
        new ApiResponse(200, diyEntries, "DIY entries retrieved successfully.")
    );
});

