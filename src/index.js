import authify from './lib/authify';

export default function app() {
  return authify;
}

if (require.main === module) {
  app();
}
