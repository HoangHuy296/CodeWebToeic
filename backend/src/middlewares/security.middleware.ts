// Express hardening for helmet/cors/rate-limit with localhost allowances for multi-port frontend development.
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/http-status.js';
import { sendError } from '../utils/api-response.js';

function isAllowedLocalDevOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

export function applySecurityMiddlewares(app: Express): void {
  const allowedOrigins = env.clientUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isAllowedLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204,
  };

  app.set('trust proxy', false);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(cors(corsOptions));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 200,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      handler: (_req, res, _next, options) =>
        sendError(
          res,
          options.statusCode ?? HTTP_STATUS.TOO_MANY_REQUESTS,
          'Too many requests, please try again later.',
          [],
        ),
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));
}
