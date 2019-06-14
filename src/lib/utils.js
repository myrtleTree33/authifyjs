import jwt from 'jsonwebtoken';

const { AUTH_JWT_SECRET, AUTH_JWT_AUDIENCE, AUTH_JWT_ISSUER } = process.env;

export const generateAccessToken = userId =>
  jwt.sign({}, AUTH_JWT_SECRET, {
    expiresIn: AUTH_JWT_EXPIRY,
    audience: AUTH_JWT_AUDIENCE,
    issuer: AUTH_JWT_ISSUER,
    subject: userId.toString()
  });
