import mongoose from 'mongoose';

const diySchema = new mongoose.Schema(
    {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: {
            type: String,
            required: true,
            trim: true
        },
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        exercises: {
            type: [String],
            required: true,
            validate: {
                validator: function (arr) {
                    return arr.length  > 1 ; // Must have at least one exercise
                },
                message: 'There must be at least two exercise.'
            }
        }
    },
    { timestamps: true }
);

const DIY = mongoose.model('DIY', diySchema);

export { DIY };
