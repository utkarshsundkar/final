import express from 'express';
import {
    saveOnboarding,
    findOnboardingByEmail,
    updateOnboarding,
    updateOnboardingForAuthUser,
    completeOnboarding,
    getOnboardingForAuthUser
} from '../controllers/onBoarding.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Old routes (keep for backward compatibility)
router.post('/save', saveOnboarding);
router.post('/find-onboarding-by-email', findOnboardingByEmail);
router.post('/update-old', updateOnboarding);

// New authenticated routes
router.get('/', verifyJWT, getOnboardingForAuthUser);
router.post('/update', verifyJWT, updateOnboardingForAuthUser);
router.post('/complete', verifyJWT, completeOnboarding);

export default router;
