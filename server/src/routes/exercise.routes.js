import express from 'express';
import { getUserExercises, saveExercise, saveFocusExercise, updateExerciseProgress, getTotalReps } from '../controllers/exercise.controller.js';

const router = express.Router();

// POST route to save exercise
router.post('/save', saveExercise);
router.post('/saveFocus', saveFocusExercise);
router.patch('/update', updateExerciseProgress);
router.get('/getAll/:userId', getUserExercises);
router.get('/total-reps', getTotalReps);

export default router;
