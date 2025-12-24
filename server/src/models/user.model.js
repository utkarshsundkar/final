import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: false, // Changed for MojoAuth Support
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    credits: {
      type: Number,
      default: 0,
      min: [0, "Credits cannot be negative"],
    },
    // 1:1 Relationship
    onboarding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Onboarding",
      default: null,
    },
    // 1:M Relationships (should be arrays for history tracking)
    lifestyle: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lifestyle",
      },
    ],
    diy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DIY",
      },
    ],
    diet: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Diet",
      },
    ],
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
      },
    ],
    currentFocusSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FocusSession",
      default: null,
    },
    focusSessions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "FocusSession" },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    premium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Premium",
      default: null,
    },
    trialActivated: {
      type: Boolean,
      default: false,
    },
    trialStartDate: {
      type: Date,
      default: null,
    },
    trialEndDate: {
      type: Date,
      default: null,
    },
    premiumType: {
      type: String,
      enum: ['trial', 'paid', null],
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    fcmToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for user's age
userSchema.virtual("age").get(function () {
  if (!this.onboarding || !this.onboarding.dob) return null;

  const today = new Date();
  const birthDate = new Date(this.onboarding.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Middleware to delete associated data
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const userId = this._id;

      await Promise.all([
        mongoose.model("Onboarding").deleteOne({ userId: userId }),
        mongoose.model("Lifestyle").deleteMany({ userId: userId }), // Changed to deleteMany
        mongoose.model("DIY").deleteMany({ userId: userId }), // Changed to deleteMany
        mongoose.model("Diet").deleteMany({ userId: userId }), // Changed to deleteMany
        mongoose.model("Exercise").deleteMany({ userId: userId }),
      ]);

      next();
    } catch (error) {
      next(error);
    }
  }
);

// Indexes

userSchema.index({ createdAt: -1 });

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Password verification
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Access token generation
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// Refresh token generation
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
