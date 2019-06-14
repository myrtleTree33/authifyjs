// import facebookMapper from './mappers/facebookMapper'
import defaultMapper from './mappers/defaultMapper';
import classicMapper from './mappers/classicMapper';
import User from './models/User';

const authify = ({ app, userModel = User, opts = {} }) => {
  console.log('Binding authify..');
  if (!app) {
    throw new Error('No app specified');
  }

  const { useFacebook, useClassic } = opts;

  // Run the default mapper
  defaultMapper({ app, User: userModel });

  if (useClassic) {
    classicMapper({ app, User: userModel });
  }

  if (useFacebook) {
    // TODO ------------------------
    // facebookMapper({ app, userModel });
  }
  console.log('Authify bound.');
};

export default authify;
