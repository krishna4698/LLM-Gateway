import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_secret';
const ACCESS_TOKEN_EXPIRATION = (process.env.ACCESS_TOKEN_EXPIRATION || '15m') as NonNullable<SignOptions['expiresIn']>;

export interface AccessTokenPayload {
  userId: number;
  email: string;
  jti: string;
}

export const generateAccessToken = (user: { id: number; email: string }): { accessToken: string; jti: string } => {
  const jti = crypto.randomUUID();
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    jti,
  };
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, options);
  return { accessToken, jti };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
