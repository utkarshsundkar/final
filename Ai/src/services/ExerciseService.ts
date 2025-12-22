import axios from 'axios';
import { Platform } from 'react-native';
import AuthService from './AuthService';

const isAndroid = Platform.OS === 'android';

// Base URL matching AuthService logic
// Production Render URL
const BASE_URL = 'https://final-z80k.onrender.com/api/v2';

const EXERCISE_URL = `${BASE_URL}/exercise`;

export const saveExercise = async (
    userId: string,
    exerciseName: string,
    repsPerformed: number,
    repsPerformedPerfect: number,
    isFocused: boolean = false
) => {
    try {
        const token = await AuthService.getAccessToken();
        if (!token) throw new Error('No access token');

        console.log(`Saving exercise: ${exerciseName}, Reps: ${repsPerformed}, Perfect: ${repsPerformedPerfect}`);

        const response = await axios.post(
            `${EXERCISE_URL}/save`,
            {
                userId,
                exercise_name: exerciseName,
                reps_performed: repsPerformed,
                reps_performed_perfect: repsPerformedPerfect,
                isFocused
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log('Exercise saved successfully:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Save Exercise Error:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    saveExercise
};
