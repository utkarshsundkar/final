import Lifestyle from "../models/lifeStyle.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create and Save Lifestyle Entry
const saveLifestyle = asyncHandler(async (req, res) => {
  const { userId, sleep, water, steps } = req.body;

  // Basic field validation
  if (sleep === undefined || water === undefined || steps === undefined) {
    throw new ApiError(400, "All fields (sleep, water, steps) are required");
  }

  const lifestyleEntry = await Lifestyle.create({
    userId,
    sleep,
    water,
    steps,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, lifestyleEntry, "Lifestyle entry saved successfully")
    );
});

// Get Lifestyle Entry by User ID
const getLifeStyle = asyncHandler(async (req, res) => {
  const { userId } = req.params;
    const { date } = req.query; // Accept date in query like: /api/v1/diet/get/:userId?date=2025-06-24

    if (!userId || !date) {
        throw new ApiError(400, 'User ID and date are required.');
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
        throw new ApiError(400, 'Invalid date format. Please use YYYY-MM-DD.');
    }

    // Set time boundaries for the entire day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Find diet entry for the user within this date
    const lifeStyleEntry = await Lifestyle.findOne({
        userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!lifeStyleEntry) {
        throw new ApiError(404, 'No diet entry found for the provided date.');
    }

    return res.status(200).json(
        new ApiResponse(200, lifeStyleEntry, 'Diet entry fetched successfully.')
    );
});

export { saveLifestyle, getLifeStyle };
