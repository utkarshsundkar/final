import { getPlan, createOrder, verifyPaymentAndActivate, getUserPlanStatus, startFreeTrial, generatePayUHash, generateDynamicPayUHash, verifyPayUPayment, createDodoPayment, verifyDodoPayment, recordDodoInitiation, handleDodoWebhook, handlePayUSuccess, handlePayUFailure } from "../controllers/payment.controller.js";
import { validateAppleReceipt, handleAppleWebhook } from "../controllers/appleIAP.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/getplan").get(verifyJWT, getPlan);
router.route("/createorder").post(verifyJWT, createOrder);
router.route("/verifyPayment").post(verifyJWT, verifyPaymentAndActivate);
router.route("/user-plan-status").get(verifyJWT, getUserPlanStatus);
router.route("/start-free-trial").post(verifyJWT, startFreeTrial);
router.route("/payu-hash").post(verifyJWT, generatePayUHash);
router.route("/hash").post(generateDynamicPayUHash);
router.route("/verify-payu").post(verifyJWT, verifyPayUPayment);

// PayU callback routes (no auth required - these are called by PayU gateway)
router.route("/payu-success").post(handlePayUSuccess);
router.route("/payu-failure").post(handlePayUFailure);

// Dodo Payments routes
router.route("/create-dodo-payment").post(verifyJWT, createDodoPayment);
router.route("/verify-dodo-payment").post(verifyJWT, verifyDodoPayment);
router.route("/record-dodo-initiation").post(verifyJWT, recordDodoInitiation);
router.route("/dodo-webhook").post(handleDodoWebhook);

// Apple IAP routes
router.route("/validate-apple-receipt").post(verifyJWT, validateAppleReceipt);
router.route("/apple-webhook").post(handleAppleWebhook); // No auth - Apple server calls this


export default router;