import axios from 'axios';
import { Platform } from 'react-native';
import AuthService from './AuthService';

const isAndroid = Platform.OS === 'android';

// Base URL matching AuthService logic
// Production Render URL
const BASE_URL = 'https://final-cudk.onrender.com/api/v2';

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

export const getWorkoutStats = async (workoutType: string) => {
    console.log('[getWorkoutStats] Starting fetch for:', workoutType);
    try {
        const token = await AuthService.getAccessToken();
        console.log('[getWorkoutStats] Token obtained:', token ? 'YES' : 'NO');

        if (!token) {
            console.warn('[getWorkoutStats] No auth token for stats fetch');
            return { attempts: 0, perfect: 0 };
        }

        console.log('[getWorkoutStats] Making API call to:', `${EXERCISE_URL}/stats`);
        const response = await axios.get(`${EXERCISE_URL}/stats`, {
            params: { exercise_name: workoutType },
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('[getWorkoutStats] Response received:', response.data);

        if (response.data?.success && response.data?.data) {
            const result = {
                attempts: response.data.data.attempts || 0,
                perfect: response.data.data.perfect || 0
            };
            console.log('[getWorkoutStats] Returning stats:', result);
            return result;
        }

        console.log('[getWorkoutStats] No valid data in response, returning zeros');
        return { attempts: 0, perfect: 0 };
    } catch (error: any) {
        console.error('[getWorkoutStats] Error:', error.message);
        console.error('[getWorkoutStats] Error details:', error.response?.data || error);
        return { attempts: 0, perfect: 0 };
    }
};

export const saveWorkoutCompletion = async (
    userId: string,
    workoutName: string,
    exercises: any[],
    isPerfect?: boolean
) => {
    try {
        const token = await AuthService.getAccessToken();
        if (!token) throw new Error('No access token');

        console.log(`Saving workout completion: ${workoutName}`);

        const response = await axios.post(
            `${EXERCISE_URL}/complete`,
            {
                userId,
                workout_name: workoutName,
                exercises,
                is_perfect: isPerfect
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log('Workout completion saved:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Save Workout Completion Error:', error.response?.data || error.message);
        throw error;
    }
};

export default {
    saveExercise,
    getWorkoutStats,
    saveWorkoutCompletion
};
