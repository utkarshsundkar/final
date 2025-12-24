import express from "express"
import cors from "cors"
import mongoSanitize from "express-mongo-sanitize"
import dotenv from "dotenv";
dotenv.config();


const app = express()

// const SELF_URL = 'https://your-app-name.onrender.com';
// setInterval(() => {
//   axios.get(SELF_URL)
//     .then(() => console.log(`[PING] Self-pinged at ${new Date().toLocaleTimeString()}`))
//     .catch((err) => console.error('[PING ERROR]', err.message));
// }, 14 * 60 * 1000);


// app.use((req, res, next) => {
//     console.log(`Received ${req.method} request to ${req.url}`);
//     console.log("Request Headers:", req.headers);
//     console.log("Request Body:", req.body);
//     next();
// });

app.use(cors({
  origin: "*", // Allow all for dev
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Added PATCH
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
}));

// Handle OPTIONS preflight requests
app.options("*", cors());



app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

// Security middleware to prevent NoSQL injection attacks
app.use(mongoSanitize({
  allowDots: true, // Allow dots in keys
  replaceWith: '_'
}))

//routes import
import userRouter from './routes/user.routes.js'
import exerciseRouter from "./routes/exercise.routes.js"
import cookieParser from "cookie-parser"
import diyRouter from "./routes/diy.routes.js"
import onboardingRouter from "./routes/onBoarding.routes.js"
import dietRouter from "./routes/diet.routes.js"
import creditRouter from "./routes/credit.routes.js"
import lifestyleRouter from "./routes/lifeStyle.routes.js"
import focusRouter from "./routes/focusMode.routes.js"
import paymentRouter from "./routes/payment.routes.js"
import challengeRouter from "./routes/challenge.routes.js"
import healthRouter from "./routes/health.routes.js"
import { ApiError } from "./utils/ApiError.js"

//routes declaration
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Arthlete API"
  });
});

app.use("/api/v2/users", userRouter)
app.use("/api/v2/diet", dietRouter)
app.use("/api/v2/exercise", exerciseRouter)
app.use("/api/v2/diy", diyRouter)
app.use("/api/v2/onboarding", onboardingRouter)
app.use("/api/v2/lifestyle", lifestyleRouter)
app.use("/api/v2/credit", creditRouter)
app.use("/api/v2/focus", focusRouter)
app.use("/api/v2/payment", paymentRouter)
app.use("/api/v2/challenges", challengeRouter)
app.use("/health", healthRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

export { app }