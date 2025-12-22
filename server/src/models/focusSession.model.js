import mongoose from "mongoose";

const focusSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
    isCompleted: { type: Boolean, default: false },
       imperfectReps: { type: Number, default: 0 },
    creditsDeducted: { type: Number, default: 0 }
}, { timestamps: true });

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);
export default FocusSession;
