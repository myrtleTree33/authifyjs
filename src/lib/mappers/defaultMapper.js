import passport from 'passport';
import passportJwt from 'passport-jwt';

const { AUTH_JWT_SECRET, AUTH_JWT_AUDIENCE, AUTH_JWT_ISSUER } = process.env;

/**
 * Initializes passport using server-based storage (sessions)
 *
 * @param {*} app
 */
const init = ({ app, userModel }) => {
  app.use(passport.initialize());

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // Get the JWT from the "Authorization" header.
  // By default this looks for a "JWT " prefix
  const jwtToken = passportJwt.ExtractJwt.fromAuthHeaderWithScheme('jwt');

  // set JWT options
  const jwtOptions = {
    jwtFromRequest: jwtToken,
    secretOrKey: AUTH_JWT_SECRET,
    issuer: AUTH_JWT_ISSUER,
    audience: AUTH_JWT_AUDIENCE
  };

  // Bind Passport JS
  passport.use(
    new passportJwt.Strategy(jwtOptions, (payload, done) => {
      const userId = payload.sub;
      userModel
        .findById(userId)
        .then(user => done(null, user, payload))
        .catch(err => done(err));
    })
  );
};

export default init;
