import mongoose from 'mongoose';
import { User } from './server/src/models/user.model.js';
import dotenv from 'dotenv';
dotenv.config({path: './server/.env'});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
  const email = "test3@gmail.com"; // Provide the user's email here if possible, let's just pick one with a trial.
  const user = await User.findOne({ trialActivated: true });
  if (user) {
    if (user.trialEndDate && user.trialEndDate < new Date()) {
        user.isPremium = false;
        user.premiumType = null;
    }
    console.log("Raw user object:", user);
    console.log("JSONified user object:", user.toJSON());
  } else {
    console.log("No user found with trial.");
  }
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
