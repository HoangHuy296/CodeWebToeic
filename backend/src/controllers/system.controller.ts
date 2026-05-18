import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { sendSuccess } from '../utils/api-response.js';

export function getRoot(_req: Request, res: Response): Response {
  return sendSuccess(res, HTTP_STATUS.OK, 'IVYTS 1997 backend is running', {
    service: 'backend',
    version: 'phase-2',
  });
}

export function getHealth(_req: Request, res: Response): Response {
  return sendSuccess(res, HTTP_STATUS.OK, 'Service healthy', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

