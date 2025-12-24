import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  mojoAuthLogin,
  checkEmailExists,
  getLeaderboard,
  activateFreeTrial,
  fixTrialUsers,
  updateFcmToken
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/auth-mojo").post(mojoAuthLogin);
router.route("/check-email").post(checkEmailExists);
router.route("/change-password").post(changeCurrentPassword);
router.route("/leaderboard").get(getLeaderboard); // Public leaderboard

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/activate-trial").post(verifyJWT, activateFreeTrial);
router.route("/update-fcm-token").post(verifyJWT, updateFcmToken);
router.route("/fix-trial-users").post(fixTrialUsers); // Temporary fix endpoint

export default router;
