import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
    challenger: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opponent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exercise: {
        type: String,
        required: true
    },
    targetReps: {
        type: Number,
        required: true
    },
    timeLimit: {
        type: Number, // in seconds
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'completed', 'expired'],
        default: 'pending'
    },
    challengerResult: {
        reps: { type: Number, default: 0 },
        perfectReps: { type: Number, default: 0 },
        completedAt: { type: Date }
    },
    opponentResult: {
        reps: { type: Number, default: 0 },
        perfectReps: { type: Number, default: 0 },
        completedAt: { type: Date }
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Index for querying challenges
challengeSchema.index({ challenger: 1, status: 1 });
challengeSchema.index({ opponent: 1, status: 1 });
challengeSchema.index({ expiresAt: 1 });

export const Challenge = mongoose.model('Challenge', challengeSchema);
