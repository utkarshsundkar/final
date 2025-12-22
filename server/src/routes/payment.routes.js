import { getPlan, createOrder, verifyPaymentAndActivate, getUserPlanStatus, startFreeTrial } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/getplan").get(verifyJWT, getPlan);
router.route("/createorder").post(verifyJWT, createOrder);
router.route("/verifyPayment").post(verifyJWT, verifyPaymentAndActivate);
router.route("/user-plan-status").get(verifyJWT, getUserPlanStatus);
router.route("/start-free-trial").post(verifyJWT, startFreeTrial);
// router.route("/payu-hash").post(verifyJWT, generatePayUHash);
// router.route("/hash").post(generateDynamicPayUHash); 


export default router;