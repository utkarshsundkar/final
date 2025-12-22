import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

import connectDB from "./src/db/index.js";
import { app } from './src/app.js';



// 🟢 Start server after DB connection
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 8000;
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed!", err);
    });
