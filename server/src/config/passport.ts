import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { database } from './db.js';
import crypto from 'crypto';

export const configurePassport = () => {
  const getUsersContainer = () => database.container("Users");

  passport.serializeUser((user: any, done) => {
    if (!user || !user.googleId) {
      console.error("Serialize failed - user missing googleId");
      return done(new Error("User object missing googleId"), null);
    }
    done(null, user.googleId);
  });

  passport.deserializeUser(async (googleId: string, done) => {
    try {
      console.log("Attempting to deserialize:", googleId);
      const container = database.container("Users");
      
      const { resources } = await container.items
        .query({
          query: "SELECT * FROM c WHERE c.googleId = @gid",
          parameters: [{ name: "@gid", value: googleId }]
        })
        .fetchAll();
      
      if (resources.length > 0) {
        const user = resources[0];
        console.log("Found user object in DB:", user.id);
        done(null, user);
      } else {
        console.log("User NOT found in DB for googleId:", googleId);
        done(null, false);
      }
    } catch (err) {
      console.error("Deserialize Error:", err);
      done(err, null);
    }
  });

  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const container = getUsersContainer();
        const { resources } = await container.items
          .query({
            query: "SELECT * FROM c WHERE c.googleId = @gid",
            parameters: [{ name: "@gid", value: profile.id }]
          })
          .fetchAll();

        if (resources.length > 0) {
          console.log("Google Strategy - Existing user found");
          return done(null, resources[0]);
        }

        console.log("Google Strategy - Creating new user");
        const newUser = {
          id: crypto.randomUUID(), 
          googleId: profile.id,   
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          avatar: profile.photos?.[0]?.value || '',
          budgets: {},
          createdAt: new Date().toISOString()
        };
        
        const { resource } = await container.items.create(newUser);
        return done(null, resource);
      } catch (err) { 
        console.error("Google Strategy Error:", err);
        return done(err as any, undefined); 
      }
    }
  ));
};