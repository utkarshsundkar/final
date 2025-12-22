import mongoose from 'mongoose';
import { User } from './user.model.js';

const dietSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  primaryGoal: {
    type: String,
    required: true,
    enum: ['Weight Loss', 'Muscle Gain', 'Endurance', 'Maintenance', 'Toning', 'Build muscle']
  },
  calorie: {
    type: Number,
    required: true,
    min: [0, 'Calories cannot be negative']
  },
  protein: {
    type: Number,
    required: true,
    min: [0, 'Protein cannot be negative']
  },
  carbs: {
    type: Number,
    required: true,
    min: [0, 'Carbs cannot be negative']
  },
  fats: {
    type: Number,
    required: true,
    min: [0, 'Fats cannot be negative']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for macro percentages
dietSchema.virtual('macroPercentages').get(function() {
  const total = (this.protein * 4) + (this.carbs * 4) + (this.fats * 9);
  return {
    protein: total ? ((this.protein * 4) / total * 100).toFixed(1) : 0,
    carbs: total ? ((this.carbs * 4) / total * 100).toFixed(1) : 0,
    fats: total ? ((this.fats * 9) / total * 100).toFixed(1) : 0
  };
});

// Post-save hook to push diet _id to user's diet array
dietSchema.post('save', async function (doc, next) {
    try {
        await User.findByIdAndUpdate(doc.userId, {
            $push : { diet: doc._id } // Prevents duplicate entries
        });
        next();
    } catch (error) {
        console.error('Error pushing diet ID to user:', error);
        next(error);
    }
});

const Diet = mongoose.model('Diet', dietSchema);
export default Diet;