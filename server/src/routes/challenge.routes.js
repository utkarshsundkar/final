import { Router } from "express";
import {
    findOpponent,
    createChallenge,
    getUserChallenges,
    acceptChallenge,
    submitChallengeResult
} from "../controllers/challenge.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router.route("/find-opponent").get(findOpponent);
router.route("/create").post(createChallenge);
router.route("/my-challenges").get(getUserChallenges);
router.route("/:challengeId/accept").post(acceptChallenge);
router.route("/:challengeId/submit-result").post(submitChallengeResult);

export default router;
