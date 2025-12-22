import mongoose from 'mongoose';
import { User } from './user.model.js';

const lifestyleSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   sleep: {
  type: Number,
  required: true,
  min: [0, 'Sleep cannot be negative'],
  max: [24, 'Sleep cannot exceed 24 hours']
},
water: {
  type: Number,
  required: true,
  min: [0, 'Water cannot be negative']
},
steps: {
  type: Number,
  required: true,
  min: [0, 'Steps cannot be negative']
}
}, { timestamps: true }); // Adds createdAt and updatedAt fields

// 🔗 Post-save hook to push lifestyle _id to user's lifestyle array
lifestyleSchema.post('save', async function (doc, next) {
    try {
        await User.findByIdAndUpdate(doc.userId, {
            $push: { lifestyle: doc._id }
        });
        next();
    } catch (error) {
        console.error('Error pushing lifestyle ID to user:', error);
        next(error);
    }
});

const Lifestyle = mongoose.model('Lifestyle', lifestyleSchema);

export default Lifestyle;
