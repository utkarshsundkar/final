import Onboarding from "../models/onBoarding.model.js";
import { User } from "../models/user.model.js";
import { onboardingSchema } from "../validators/onBoarding.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const saveOnboarding = asyncHandler(async (req, res, next) => {
  // Validate input
  const { error, value } = onboardingSchema.validate(req.body);

  console.log("Onboarding data received:", value);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  // Save onboarding data
  const onboardingData = await Onboarding.create(value);

  // Manually update the user's onboarding field to ensure it's complete
  await User.findByIdAndUpdate(value.userId, {
    $set: { onboarding: onboardingData._id },
  });

  console.log("User onboarding field updated successfully");

  // Send success response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        onboardingData,
        "Onboarding data saved successfully."
      )
    );
});

const findOnboardingByEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  console.log("getUserByEmail email:", email);
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email }).select("-password -refreshToken").populate("onboarding");
  console.log("user", user);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const onBoarding = await Onboarding.findOne({ _id: user.onboarding._id });
  console.log("onBoarding", onBoarding);

  if (!onBoarding) {
    throw new ApiError(404, "Onboarding data not found for this user");
  }
  return res.status(200).json(
    new ApiResponse(200, onBoarding, "Onboarding data fetched successfully.")
  );
});





const updateOnboarding = asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = onboardingSchema.validate(req.body);

  console.log("Onboarding update data received:", value);

  if (error) {
    throw new ApiError(400, error.details[0].message);
  }

  const { userId } = value;

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let onboardingData;

  if (user.onboarding) {
    // Update existing onboarding data
    onboardingData = await Onboarding.findByIdAndUpdate(
      user.onboarding,
      value,
      { new: true }
    );
  } else {
    // If for some reason user doesn't have onboarding linked, create new
    onboardingData = await Onboarding.create(value);
    user.onboarding = onboardingData._id;
    await user.save();
  }

  console.log("Onboarding data updated successfully");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        onboardingData,
        "Onboarding data updated successfully."
      )
    );
});

// Update onboarding for authenticated user (supports partial updates)
const updateOnboardingForAuthUser = asyncHandler(async (req, res) => {
  const userId = req.user._id; // From JWT middleware
  const updateData = req.body;

  console.log("Updating onboarding for user:", userId);
  console.log("Update data:", updateData);

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  let onboardingData;

  if (user.onboarding) {
    // Update existing onboarding data (partial update)
    onboardingData = await Onboarding.findByIdAndUpdate(
      user.onboarding,
      { $set: updateData },
      { new: true, runValidators: false } // Don't run validators for partial updates
    );
  } else {
    // Create new onboarding document
    onboardingData = await Onboarding.create({
      userId,
      ...updateData
    });
    user.onboarding = onboardingData._id;
    await user.save();
  }

  return res.status(200).json(
    new ApiResponse(200, onboardingData, "Onboarding data updated successfully.")
  );
});

// Mark onboarding as completed
const completeOnboarding = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { onboardingCompleted: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { onboardingCompleted: true }, "Onboarding completed successfully.")
  );
});

// Get onboarding data for authenticated user
const getOnboardingForAuthUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).populate("onboarding");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, user.onboarding, "Onboarding data fetched successfully.")
  );
});

export {
  saveOnboarding,
  findOnboardingByEmail,
  updateOnboarding,
  updateOnboardingForAuthUser,
  completeOnboarding,
  getOnboardingForAuthUser
};
