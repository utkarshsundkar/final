import express from 'express';
import { saveLifestyle , getLifeStyle } from '../controllers/lifeStyle.controller.js';
import { get } from 'mongoose';

const router = express.Router();

// Create Lifestyle entry
router.post('/save', saveLifestyle);
router.get('/get/:userId', getLifeStyle);

export default router;
