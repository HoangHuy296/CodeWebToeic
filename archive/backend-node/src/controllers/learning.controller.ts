import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import { getLearningData } from '../services/learning.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getLearningDataHandler(req: Request, res: Response): Promise<Response> {
  const data = await getLearningData(String(req.params.courseId), req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Learning data fetched successfully', data);
}
