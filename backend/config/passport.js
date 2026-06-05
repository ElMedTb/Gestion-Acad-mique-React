import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            const email =
              profile.emails && profile.emails.length > 0
                ? profile.emails[0].value
                : `${profile.id}@google.oauth`;

            user = await User.findOne({ email });

            if (user) {
              user.googleId = profile.id;
              user.emailVerified = true;
              await user.save();
            } else {
              user = await User.create({
                googleId: profile.id,
                email,
                firstName: profile.name?.givenName || 'Google',
                lastName: profile.name?.familyName || 'User',
                password: `oauth_${Date.now()}_${Math.random()}`,
                role: 'student',
                emailVerified: true,
                mustChangePassword: false,
              });
            }
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
}

export default passport;
