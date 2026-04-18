import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { initDatabase, client } from './config/cosmos.js';
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

class NativeCosmosStore extends session.Store {
  private container: any;
  
  constructor() {
    super();
    this.container = client.database("BudgieDB").container("Sessions");
  }

  async get(sid: string, callback: any) {
    try {
      const { resource } = await this.container.item(sid, sid).read();
      if (!resource) return callback(null, null);
      callback(null, resource.sessionData);
    } catch (err: any) {
      if (err.code === 404) return callback(null, null);
      callback(err);
    }
  }

  async set(sid: string, sessionData: any, callback: any) {
    try {
      await this.container.items.upsert({ 
        id: sid, 
        sessionData,
        ttl: 86400 
      });
      callback(null);
    } catch (err) { 
      callback(err); 
    }
  }

  async destroy(sid: string, callback: any) {
    try {
      await this.container.item(sid, sid).delete();
      callback(null);
    } catch (err: any) {
      if (err.code === 404) return callback(null);
      callback(err);
    }
  }
}

const startServer = async () => {
  try {
    await initDatabase();

    configurePassport();
    
    app.use(session({
      name: 'budgie_sid', 
      store: new NativeCosmosStore(),
      secret: process.env.SESSION_SECRET || 'keyboard_cat',
      resave: true,               
      saveUninitialized: false,    
      rolling: true,            
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
      passport.authenticate('google', { failureRedirect: 'http://localhost:5174/login' }),
      (req, res) => { 
        res.redirect('http://localhost:5174'); 
      }
    );

    app.get('/api/auth/logout', (req, res, next) => {
      req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
          res.clearCookie('budgie_sid');
          res.redirect('http://localhost:5174/login');
        });
      });
    });
    
    app.listen(PORT, () => console.log(`🚀 Server flying on http://localhost:${PORT}`));
  } catch (err) {
    console.error('FAILED TO LAUNCH:', err);
    process.exit(1);
  }
};

startServer();