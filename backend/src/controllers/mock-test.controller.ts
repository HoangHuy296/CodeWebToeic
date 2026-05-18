import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  createMockTest,
  deleteMockTest,
  getMockTestById,
  listManagedMockTests,
  listMockTests,
  submitMockTest,
  updateMockTest,
} from '../services/mock-test.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getMockTestsHandler(req: Request, res: Response): Promise<Response> {
  const data = await listMockTests(req.user);
  return sendSuccess(res, HTTP_STATUS.OK, 'Mock tests fetched successfully', data);
}

export async function getManagedMockTestsHandler(req: Request, res: Response): Promise<Response> {
  const data = await listManagedMockTests(req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Managed mock tests fetched successfully', data);
}

export async function getMockTestDetailHandler(req: Request, res: Response): Promise<Response> {
  const data = await getMockTestById(String(req.params.id), req.user);
  return sendSuccess(res, HTTP_STATUS.OK, 'Mock test fetched successfully', data);
}

export async function createMockTestHandler(req: Request, res: Response): Promise<Response> {
  const data = await createMockTest(req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Mock test created successfully', data);
}

export async function updateMockTestHandler(req: Request, res: Response): Promise<Response> {
  const data = await updateMockTest(String(req.params.id), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Mock test updated successfully', data);
}

export async function deleteMockTestHandler(req: Request, res: Response): Promise<Response> {
  await deleteMockTest(String(req.params.id), req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Mock test deleted successfully', {});
}

export async function submitMockTestHandler(req: Request, res: Response): Promise<Response> {
  const data = await submitMockTest(String(req.params.id), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Mock test submitted successfully', data);
}
