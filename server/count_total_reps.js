import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from './src/models/exercise.model.js';
import { DB_NAME } from './src/constants.js';

dotenv.config({
    path: './.env'
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const countTotalReps = async () => {
    await connectDB();

    try {
        // Total Reps (All Time)
        const resultTotal = await Exercise.aggregate([
            {
                $group: {
                    _id: null,
                    totalReps: { $sum: "$reps_performed" }
                }
            }
        ]);

        // Total Reps (Today)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const resultToday = await Exercise.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay }
                }
            },
            {
                $group: {
                    _id: null,
                    totalReps: { $sum: "$reps_performed" }
                }
            }
        ]);

        const totalReps = resultTotal.length > 0 ? resultTotal[0].totalReps : 0;
        const todayReps = resultToday.length > 0 ? resultToday[0].totalReps : 0;

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🏋️  Stats Overview`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`📅 Today's Reps:     ${todayReps}`);
        console.log(`📈 All-Time Reps:    ${totalReps}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    } catch (error) {
        console.error(`Error counting reps: ${error.message}`);
    } finally {
        mongoose.connection.close();
    }
};

countTotalReps();
