import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';
import createError from 'http-errors';

import { generateAccessToken } from '../utils';

const init = ({ app, User }) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        session: false
      },
      (username, password, done) => {
        User.findOne({
          email: username
        })
          .select('+passwordHash')
          .exec((err, user) => {
            // Throw error if there is
            if (err) {
              return done(err);
            }

            // Reject if user not found
            if (!user) {
              return done(null, false);
            }

            // Verify password
            const { passwordHash } = user;
            if (!bcrypt.compareSync(password, passwordHash)) {
              return done(null, false);
            }

            // Success
            return done(null, user);
          });
      }
    )
  );

  // Init classic token verification
  app.post(
    '/auth/classic/token',
    passport.authenticate('local'),
    (req, res) => {
      const { user } = req;
      const u = user.toJSON();

      // Ensure sensitive info not passed
      u.social = null;
      delete u.passwordHash;

      // Create a new access token
      const token = generateAccessToken(u.id);
      return res.json({ token, user: u });
    }
  );

  // Creates a new user
  app.post('/auth/classic/new', (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;
    const passwordHash = bcrypt.hashSync(password, 10);
    new User({
      email,
      passwordHash,
      details: {
        firstName,
        lastName
      },
      social: null
    }).save((err, user) => {
      if (err) {
        return next(createError(400, 'Error creating user'));
      }
      const u = user.toObject();
      delete u.passwordHash;
      u.social = null;
      return res.json({ user: u });
    });
  });

  console.log('Initiated Classic login auth!');
};

export default init;
