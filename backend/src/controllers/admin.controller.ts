import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  deactivateAdminUser,
  getAdminStats,
  getAdminUserById,
  getEnrollmentChart,
  getRevenueChart,
  listAdminUsers,
  updateAdminUser,
} from '../services/admin.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getAdminStatsHandler(_req: Request, res: Response): Promise<Response> {
  const data = await getAdminStats();
  return sendSuccess(res, HTTP_STATUS.OK, 'Admin stats fetched successfully', data);
}

export async function getRevenueChartHandler(_req: Request, res: Response): Promise<Response> {
  const data = await getRevenueChart();
  return sendSuccess(res, HTTP_STATUS.OK, 'Revenue chart fetched successfully', data);
}

export async function getEnrollmentChartHandler(_req: Request, res: Response): Promise<Response> {
  const data = await getEnrollmentChart();
  return sendSuccess(res, HTTP_STATUS.OK, 'Enrollment chart fetched successfully', data);
}

export async function listAdminUsersHandler(_req: Request, res: Response): Promise<Response> {
  const data = await listAdminUsers();
  return sendSuccess(res, HTTP_STATUS.OK, 'Users fetched successfully', data);
}

export async function getAdminUserByIdHandler(req: Request, res: Response): Promise<Response> {
  const data = await getAdminUserById(String(req.params.id));
  return sendSuccess(res, HTTP_STATUS.OK, 'User fetched successfully', data);
}

export async function updateAdminUserHandler(req: Request, res: Response): Promise<Response> {
  const data = await updateAdminUser(String(req.params.id), req.body, req.user!.userId);
  return sendSuccess(res, HTTP_STATUS.OK, 'User updated successfully', data);
}

export async function deactivateAdminUserHandler(req: Request, res: Response): Promise<Response> {
  const data = await deactivateAdminUser(String(req.params.id), req.user!.userId);
  return sendSuccess(res, HTTP_STATUS.OK, 'User deactivated successfully', data);
}

