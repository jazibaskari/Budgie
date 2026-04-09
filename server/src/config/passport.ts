import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { client } from './cosmos.js';
import dotenv from 'dotenv';

dotenv.config();

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const database = client.database("BudgieDB");
          const container = database.container("Users");

          const { resource: existingUser } = await container.item(profile.id, profile.id).read();

          if (existingUser) {
            console.log(`👋 Welcome back, ${existingUser.displayName}`);
            
            const updatedUser = { ...existingUser, lastLogin: new Date().toISOString() };
            await container.item(profile.id, profile.id).replace(updatedUser);
            
            return done(null, updatedUser);
          }

          const primaryEmail = profile.emails && profile.emails.length > 0 
            ? profile.emails[0]!.value 
            : '';

          const primaryPhoto = profile.photos && profile.photos.length > 0 
            ? profile.photos[0]!.value 
            : '';

          const newUser = {
            id: profile.id, 
            email: primaryEmail,
            displayName: profile.displayName,
            avatar: primaryPhoto,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          await container.items.create(newUser);
          console.log(`New Budgie User Created: ${newUser.displayName}`);

          return done(null, newUser);
        } catch (error) {
          console.error("Cosmos DB Auth Error:", error);
          return done(error as Error, undefined);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const container = client.database("BudgieDB").container("Users");
      const { resource: user } = await container.item(id, id).read();
      done(null, user);
    } catch (error) {
      console.error("Deserialisation Error:", error);
      done(error, null);
    }
  });
};