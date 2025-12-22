import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Challenge } from "../models/challenge.model.js";
import { User } from "../models/user.model.js";

// Find a random opponent near user's rank
const findOpponent = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all users sorted by credits
    const users = await User.find({})
        .select('username credits')
        .sort({ credits: -1, createdAt: 1 });

    // Calculate ranks
    let currentRank = 1;
    let previousCredits = null;
    const rankedUsers = users.map((user, index) => {
        if (previousCredits === null || user.credits < previousCredits) {
            currentRank = index + 1;
        }
        previousCredits = user.credits;
        return {
            userId: user._id,
            username: user.username,
            credits: user.credits,
            rank: currentRank
        };
    });

    // Find current user's rank
    const currentUser = rankedUsers.find(u => u.userId.toString() === userId.toString());
    if (!currentUser) {
        throw new ApiError(404, "User not found in leaderboard");
    }

    // Find users within ±5 ranks
    const rankRange = 5;
    const potentialOpponents = rankedUsers.filter(u =>
        u.userId.toString() !== userId.toString() &&
        Math.abs(u.rank - currentUser.rank) <= rankRange
    );

    if (potentialOpponents.length === 0) {
        // If no one in range, pick any random user
        const allOthers = rankedUsers.filter(u => u.userId.toString() !== userId.toString());
        if (allOthers.length === 0) {
            throw new ApiError(404, "No opponents available");
        }
        const randomOpponent = allOthers[Math.floor(Math.random() * allOthers.length)];
        return res.status(200).json(
            new ApiResponse(200, { opponent: randomOpponent }, "Random opponent found")
        );
    }

    // Pick random opponent from potential opponents
    const randomOpponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];

    return res.status(200).json(
        new ApiResponse(200, { opponent: randomOpponent }, "Opponent found")
    );
});

// Create a new challenge
const createChallenge = asyncHandler(async (req, res) => {
    const { opponentId, exercise, targetReps, timeLimit } = req.body;
    const challengerId = req.user._id;

    if (!opponentId || !exercise || !targetReps || !timeLimit) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if opponent exists
    const opponent = await User.findById(opponentId);
    if (!opponent) {
        throw new ApiError(404, "Opponent not found");
    }

    // Create challenge (expires in 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const challenge = await Challenge.create({
        challenger: challengerId,
        opponent: opponentId,
        exercise,
        targetReps,
        timeLimit,
        expiresAt
    });

    const populatedChallenge = await Challenge.findById(challenge._id)
        .populate('challenger', 'username credits')
        .populate('opponent', 'username credits');

    return res.status(201).json(
        new ApiResponse(201, { challenge: populatedChallenge }, "Challenge created successfully")
    );
});

// Get user's challenges (sent and received)
const getUserChallenges = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const challenges = await Challenge.find({
        $or: [
            { challenger: userId },
            { opponent: userId }
        ],
        status: { $in: ['pending', 'accepted'] }
    })
        .populate('challenger', 'username credits')
        .populate('opponent', 'username credits')
        .sort({ createdAt: -1 });

    // Separate into sent and received
    const sentChallenges = challenges.filter(c => c.challenger._id.toString() === userId.toString());
    const receivedChallenges = challenges.filter(c => c.opponent._id.toString() === userId.toString());

    return res.status(200).json(
        new ApiResponse(200, {
            sent: sentChallenges,
            received: receivedChallenges
        }, "Challenges fetched successfully")
    );
});

// Accept a challenge
const acceptChallenge = asyncHandler(async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
        throw new ApiError(404, "Challenge not found");
    }

    if (challenge.opponent.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not the opponent of this challenge");
    }

    if (challenge.status !== 'pending') {
        throw new ApiError(400, "Challenge is not pending");
    }

    challenge.status = 'accepted';
    await challenge.save();

    const populatedChallenge = await Challenge.findById(challenge._id)
        .populate('challenger', 'username credits')
        .populate('opponent', 'username credits');

    return res.status(200).json(
        new ApiResponse(200, { challenge: populatedChallenge }, "Challenge accepted")
    );
});

// Submit challenge result
const submitChallengeResult = asyncHandler(async (req, res) => {
    const { challengeId } = req.params;
    const { reps, perfectReps } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
        throw new ApiError(404, "Challenge not found");
    }

    const isChallenger = challenge.challenger.toString() === userId.toString();
    const isOpponent = challenge.opponent.toString() === userId.toString();

    if (!isChallenger && !isOpponent) {
        throw new ApiError(403, "You are not part of this challenge");
    }

    // Update result
    if (isChallenger) {
        challenge.challengerResult = {
            reps,
            perfectReps,
            completedAt: new Date()
        };
    } else {
        challenge.opponentResult = {
            reps,
            perfectReps,
            completedAt: new Date()
        };
    }

    // Check if both completed
    if (challenge.challengerResult.completedAt && challenge.opponentResult.completedAt) {
        challenge.status = 'completed';

        // Determine winner (by perfect reps, then total reps)
        const challengerScore = challenge.challengerResult.perfectReps * 100 + challenge.challengerResult.reps;
        const opponentScore = challenge.opponentResult.perfectReps * 100 + challenge.opponentResult.reps;

        if (challengerScore > opponentScore) {
            challenge.winner = challenge.challenger;
        } else if (opponentScore > challengerScore) {
            challenge.winner = challenge.opponent;
        }
        // If tied, winner remains null
    }

    await challenge.save();

    const populatedChallenge = await Challenge.findById(challenge._id)
        .populate('challenger', 'username credits')
        .populate('opponent', 'username credits')
        .populate('winner', 'username credits');

    return res.status(200).json(
        new ApiResponse(200, { challenge: populatedChallenge }, "Result submitted successfully")
    );
});

export {
    findOpponent,
    createChallenge,
    getUserChallenges,
    acceptChallenge,
    submitChallengeResult
};
