import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import session from 'express-session';
import passport from 'passport';
import { initDatabase } from './config/cosmos.js';
import { configurePassport } from './config/passport.js';
import userRoutes from './routes/user.js';
import transactionRoutes from './routes/transactions.js';

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5174', 
  credentials: true,                
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: 'budgie_bird_secret', 
  resave: false,
  saveUninitialized: false, 
  cookie: { 
    secure: false,        
    httpOnly: true,       
    sameSite: 'lax',     
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

configurePassport();
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => res.send('Budgie Backend is chirping!'));

app.get('/api/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5174' }),
  (req, res) => res.redirect('http://localhost:5174')
);

app.get('/api/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('http://localhost:5174');
  });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server flying on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to launch the nest:", err);
    process.exit(1);
  }
};

startServer();