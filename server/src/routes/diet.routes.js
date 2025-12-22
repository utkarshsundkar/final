import express from 'express';
import { createDiet, getDietByDate } from '../controllers/diet.controller.js';


const router = express.Router();

// Create diet plan
router.post('/save', createDiet);
router.get('/getDietbyDate/:userId', getDietByDate);

export default router;
