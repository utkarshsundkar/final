import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found for token generation");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // console.log("🔵 Access Token:", accessToken); 
    // console.log("🔵 Access Token:", refreshToken); 

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessandRefreshTokens:", error);
    throw new ApiError(
      500,
      "something went wrong while generating Access and Refresh Tokens "
    );
  }
};


const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { username, email, password } = req.body;
  //console.log("email: ", email);
  // console.log(req.body)
  // console.log({email, username, password})

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const user = await User.create({
    username,
    email,
    password,
  });

  // console.log("user", user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Generate tokens for the newly registered user
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log('createdUser', createdUser);

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "User registered Successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //get user details
  //email & password
  //find the user
  //check password
  //generate refresh & access token
  //send cookie

  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(401, "email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "user does not exist ");
  }

  // console.log("user", user);

  const isPasswordvalid = await bcrypt.compare(password, user.password);

  if (!isPasswordvalid) {
    throw new ApiError(401, "password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("loggedInUser", loggedInUser);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  console.log("logging out user:", req.user._id);

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});


const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('premium');

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const now = new Date();
  let statusChanged = false;

  // 1. Handle Trial Expiration (Backend Legacy Fields)
  if (user.premiumType === 'trial' && user.trialEndDate && user.trialEndDate < now) {
    console.log(`🕒 Trial expired for ${user.email}`);
    user.isPremium = false;
    user.premiumType = null;
    statusChanged = true;
  }

  // 2. Handle Subscription Expiration (New Premium Model)
  if (user.premium && user.premium.endDate < now && user.premium.active) {
    console.log(`🕒 Subscription expired for ${user.email} (Plan: ${user.premium.planType})`);

    // Deactivate the premium record
    await mongoose.model('Premium').findByIdAndUpdate(user.premium._id, { active: false });

    // Update user flags
    user.isPremium = false;
    user.isPaid = false;
    user.premium = null;
    user.premiumType = null;
    statusChanged = true;
  }

  if (statusChanged) {
    await user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


// MojoAuthController: Handles both Registration and Login for OTP users
const mojoAuthLogin = asyncHandler(async (req, res) => {
  const { email, name, mojoToken } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // 1. Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    // 2. Register New User
    const baseUsername = email.split("@")[0];
    // Sanitize username: remove spaces and special chars, replace with underscores
    const sanitizedName = name
      ? name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      : baseUsername;
    const username = sanitizedName + Math.floor(Math.random() * 1000); // Add random number for uniqueness

    user = await User.create({
      username,
      email,
      // No password for OTP/Google users
    });
  }

  // 3. Generate Backend Tokens (So your backend recognizes them)
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user,
          accessToken,
          refreshToken,
          mojoToken // Pass back the original mojo token if needed
        },
        "MojoAuth Authentication Successful"
      )
    );
});


const checkEmailExists = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email required");

  const user = await User.findOne({ email });

  return res.status(200).json(
    new ApiResponse(200, { exists: !!user }, "Email check successful")
  );
});

const getLeaderboard = asyncHandler(async (req, res) => {
  // Get all users sorted by credits (descending)
  const users = await User.find({})
    .select('username email credits')
    .sort({ credits: -1, createdAt: 1 }); // Sort by credits desc, then by creation date for consistency

  // Calculate ranks with proper handling of ties
  let currentRank = 1;
  let previousCredits = null;
  let usersWithSameCredits = 0;

  const leaderboard = users.map((user, index) => {
    if (previousCredits === null || user.credits < previousCredits) {
      // New rank - account for any ties in previous rank
      currentRank = index + 1;
      usersWithSameCredits = 0;
    } else if (user.credits === previousCredits) {
      // Same credits as previous user - same rank
      usersWithSameCredits++;
    }

    previousCredits = user.credits;

    return {
      rank: currentRank,
      userId: user._id,
      username: user.username,
      email: user.email,
      credits: user.credits,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, { leaderboard }, "Leaderboard fetched successfully")
  );
});

// Activate 3-day free trial
const activateFreeTrial = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is already premium (active trial or paid)
  if (user.isPremium) {
    return res.status(200).json(
      new ApiResponse(200, {
        isPremium: true,
        trialEndDate: user.trialEndDate,
        premiumType: user.premiumType
      }, "User already has premium access")
    );
  }

  // Check if user already used their trial (but it expired)
  if (user.trialActivated) {
    return res.status(200).json(
      new ApiResponse(200, {
        alreadyUsed: true,
        trialExpired: true
      }, "Free trial already used and expired")
    );
  }

  // Activate trial
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 days from now

  user.isPremium = true;
  user.trialActivated = true;
  user.trialStartDate = new Date();
  user.trialEndDate = trialEndDate;
  user.premiumType = 'trial';

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, {
      trialEndDate,
      daysRemaining: 3
    }, "3-day free trial activated successfully")
  );
});

// Fix users with active trials but isPremium = false
const fixTrialUsers = asyncHandler(async (req, res) => {
  const now = new Date();

  // Find users with active trials but isPremium = false
  const usersToFix = await User.find({
    trialActivated: true,
    trialEndDate: { $gt: now },
    isPremium: false
  });

  console.log(`Found ${usersToFix.length} users with active trials to fix`);

  for (const user of usersToFix) {
    user.isPremium = true;
    user.premiumType = 'trial';
    await user.save();
    console.log(`✅ Fixed user: ${user.email}`);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      usersFixed: usersToFix.length,
      users: usersToFix.map(u => ({ email: u.email, trialEndDate: u.trialEndDate }))
    }, `Fixed ${usersToFix.length} users with active trials`)
  );
});

// Update FCM Token for notifications
const updateFcmToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;
  const userId = req.user?._id;

  if (!fcmToken) {
    throw new ApiError(400, "FCM Token is required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { fcmToken: fcmToken } },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { success: true }, "FCM Token updated successfully")
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  mojoAuthLogin,
  checkEmailExists,
  getLeaderboard,
  activateFreeTrial,
  fixTrialUsers,
  updateFcmToken, // Export new function
};

