import mongoose from "mongoose";
import { User } from "./user.model.js";

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exercise_name: {
      type: String,
      required: true,
    },
    reps_performed: {
      type: Number,
      required: true,
    },
    reps_performed_perfect: {
      type: Number,
      required: true,
    },
    credit_claimed:{
      type: Boolean,
      default: false,
      
    },
    isFocused: {
      type: Boolean,
      default: false
    },
    focusSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'FocusSession', default: null },
    status:{type:Boolean, default:false}

  },
  { timestamps: true }
);

// // 🔗 Post-save hook to push exercise _id to user's exercises array
// exerciseSchema.post("save", async function (doc, next) {
//   try {
//     await User.findByIdAndUpdate(doc.userId, {
//       $push: { exercises: doc._id },
//     });
//     next();
//   } catch (error) {
//     console.error("Error pushing exercise ID to user:", error);
//     next(error);
//   }
// });

const Exercise = mongoose.model("Exercise", exerciseSchema);

export default Exercise;
