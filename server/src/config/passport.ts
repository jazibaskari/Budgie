import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { client } from './cosmos.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const container = client.database("BudgieDB").container("Users");

export const configurePassport = () => {
  passport.serializeUser((user: any, done) => {

    done(null, user.googleId);
  });

  passport.deserializeUser(async (googleId: unknown, done) => {

    if (typeof googleId !== 'string') {
      return done(null, null);
    }

    try {
      const { resources } = await container.items
        .query({
          query: "SELECT * FROM c WHERE c.googleId = @gid",
          parameters: [{ name: "@gid", value: googleId }]
        })
        .fetchAll();
      done(null, resources[0] || null);
    } catch (err) {
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
        const { resources } = await container.items
          .query({
            query: "SELECT * FROM c WHERE c.googleId = @gid",
            parameters: [{ name: "@gid", value: profile.id }]
          })
          .fetchAll();

        if (resources[0]) {
          return done(null, resources[0]);
        }

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
        return done(err as any, undefined);
      }
    }
  ));
};