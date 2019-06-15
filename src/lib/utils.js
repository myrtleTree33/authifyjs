import jwt from 'jsonwebtoken';
import passport from 'passport';

export const generateAccessToken = (userId, jwt2) => {
  const { secret, issuer, audience, expiry } = jwt2;

  return jwt.sign({}, secret, {
    expiresIn: expiry,
    audience,
    issuer,
    subject: userId.toString()
  });
};

export const ensureAuth = passport.authenticate('jwt', { session: false });
