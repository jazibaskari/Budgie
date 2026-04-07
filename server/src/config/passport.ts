import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export const configurePassport = () => {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback"
    },
    (token, tokenSecret, profile, done) => {
      return done(null, profile);
    }
  ));
};