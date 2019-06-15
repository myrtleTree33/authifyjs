import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcrypt';

import { generateAccessToken } from '../utils';

const init = ({ app, User, opts, jwt }) => {
  const {
    endpointNew = '/auth/classic/new',
    endpointLogin = '/auth/classic/token'
  } = opts;

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
  app.post(endpointLogin, passport.authenticate('local'), (req, res) => {
    const { user } = req;
    const u = user.toJSON();

    // Ensure sensitive info not passed
    u.social = null;
    delete u.passwordHash;

    // Create a new access token
    const token = generateAccessToken(u.id, jwt);
    return res.json({ token, user: u });
  });

  // Creates a new user
  app.post(endpointNew, async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = new User({
        email,
        passwordHash,
        details: {
          firstName,
          lastName
        },
        social: null,
        role: 'user'
      });

      const newUser = await user.save();
      const formattedUser = newUser.toObject();
      delete formattedUser.passwordHash;
      return res.json({ user: formattedUser });
    } catch (err) {
      res.status(400).json({
        message: `Issue creating user.`
      });
    }
  });

  console.log('Initiated Classic login auth!');
};

export default init;
