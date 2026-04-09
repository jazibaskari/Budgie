import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); 

import session from 'express-session';
import passport from 'passport';
import { initDatabase } from './config/cosmos.js';
import { configurePassport } from './config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(session({
  secret: 'budgie_bird_secret', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('🐦 Budgie Backend is chirping!');
});

//Google auth trigger 
app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

//Google callback  
app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.send('✅ Login Successful! Your Google account is linked.');
  }
);

const startServer = async () => {
  console.log("🎬 Starting Budgie Server...");
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server flying on http://localhost:${PORT}`);
      console.log(`🔗 Test Link: http://localhost:${PORT}/api/auth/google`);
    });
  } catch (err) {
    console.error("❌ Failed to launch the nest:", err);
    process.exit(1);
  }
};

startServer();