import passport from 'passport';
import FacebookTokenStrategy from 'passport-facebook-token';
import createError from 'http-errors';

import { generateAccessToken } from '../utils';

const init = ({ app, User, opts, jwt }) => {
  const {
    endpointLogin = '/auth/facebook/token',
    clientId,
    clientSecret
  } = opts;

  if (!clientId || !clientSecret) {
    throw new Error('No client ID or client secret specified!');
  }

  const upsertFacebookUser = async (token, tokenSecret, profile) => {
    return User.findOneAndUpdate(
      {
        'social.id': profile.id,
        'social.provider': 'facebook'
      },
      {
        details: {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName
        },
        email: profile.emails[0].value,
        social: {
          provider: 'facebook',
          id: profile.id
        }
      },
      { upsert: true, new: true }
    ).catch(e => console.error(`Error inserting Facebook user.  Error=${e}`));
  };

  passport.use(
    new FacebookTokenStrategy(
      {
        clientID: clientId,
        clientSecret
      },
      (accessToken, refreshToken, profile, next) => {
        upsertFacebookUser(accessToken, refreshToken, profile)
          .then(user => next(null, user))
          .catch(err =>
            next(createError(400, 'Error upserting Facebook user'))
          );
      }
    )
  );

  app.get(
    endpointLogin,
    passport.authenticate('facebook-token'),
    (req, res) => {
      const { user } = req;
      const token = generateAccessToken(user._id, jwt);
      return res.json({ token, user: user.toJSON() });
    }
  );

  console.log('Initiated Facebook login auth!');
};

export default init;
