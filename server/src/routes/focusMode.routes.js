import express from 'express';
import { startFocusSession, endFocusSession } from '../controllers/focusMode.controller.js';
import { checkAndFinalizePreviousFocusSession } from '../controllers/focusMode.controller.js';

const router = express.Router();

// POST route to start focus session
router.post('/start', startFocusSession);

// POST route to end focus session
router.post('/end', endFocusSession);

router.post('/check', checkAndFinalizePreviousFocusSession);

export default router;
