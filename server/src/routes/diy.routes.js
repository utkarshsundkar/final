import express from 'express';
import { createDIY, getDIYByUser } from '../controllers/diy.controller.js';

const router = express.Router();

// Create DIY plan
router.post('/save', createDIY);
// Get DIY plans by user
router.get('/getAll/:userId', getDIYByUser);

export default router;
