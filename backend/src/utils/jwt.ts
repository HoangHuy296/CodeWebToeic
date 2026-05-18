import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUser } from '../types/auth.js';

interface TokenPayload extends JwtPayload, AuthUser {}

export function signAccessToken(payload: AuthUser, options?: SignOptions): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: '15m',
    ...options,
  });
}

export function signRefreshToken(payload: AuthUser, options?: SignOptions): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: '7d',
    ...options,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}

