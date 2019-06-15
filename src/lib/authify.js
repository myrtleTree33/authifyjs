import mongoose from 'mongoose';

// import facebookMapper from './mappers/facebookMapper'
import defaultMapper from './mappers/defaultMapper';
import classicMapper from './mappers/classicMapper';
import User from './models/User';

const authify = ({ mongoUri, app, userModel = User, opts = {}, jwt = {} }) => {
  console.log('Binding authify..');
  if (!app) {
    throw new Error('No app specified');
  }

  if (!mongoUri) {
    throw new Error('mongo URI not specified.');
  }

  mongoose.connect(mongoUri);

  const { useFacebook, useClassic, classic = {}, facebook = {} } = opts;

  // Run the default mapper
  defaultMapper({ app, User: userModel });

  if (useClassic) {
    classicMapper({ app, User: userModel, opts: classic, jwt });
  }

  if (useFacebook) {
    // TODO ------------------------
    // facebookMapper({ app, userModel });
  }
  console.log('Authify bound.');
};

export default authify;
