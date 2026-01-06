import express from 'express';
import { getUserExercises, saveExercise, saveFocusExercise, updateExerciseProgress, getTotalReps, getWorkoutStats, saveWorkoutCompletion } from '../controllers/exercise.controller.js';

const router = express.Router();

// POST route to save exercise
router.post('/save', saveExercise);
router.post('/saveFocus', saveFocusExercise);
router.post('/complete', saveWorkoutCompletion);
router.patch('/update', updateExerciseProgress);
router.get('/getAll/:userId', getUserExercises);
router.get('/total-reps', getTotalReps);
router.get('/stats', getWorkoutStats);

export default router;
