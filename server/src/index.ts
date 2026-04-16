import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { initDatabase } from './config/cosmos.js';
import { configurePassport } from './config/passport.js';
import authRoutes from './routes/auth.js'; 
import userRoutes from './routes/user.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);


app.use(cors({ 
  origin: 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

const startServer = async () => {
  try {
    await initDatabase();
    configurePassport();
    
    app.use(session({
      name: 'finance_app_dev',
      secret: process.env.SESSION_SECRET!,
      resave: true,
      saveUninitialized: true,
      cookie: { 
        secure: false, 
        httpOnly: true, 
        sameSite: 'lax', 
        maxAge: 24 * 60 * 60 * 1000 
      }
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/monzo', transactionRoutes); 

    app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    app.get('/api/auth/google/callback', 
      passport.authenticate('google', { failureRedirect: 'http://localhost:5174' }),
      (req, res) => { res.redirect('http://localhost:5174'); }
    );
    
    app.listen(PORT, () => console.log(`Server flying on http://localhost:${PORT}`));
  } catch (err) {
    console.error('FAILED TO LAUNCH:', err);
    process.exit(1);
  }
};

startServer();