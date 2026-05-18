import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  enrollCourse,
  getCourseEnrollments,
  getMyEnrollments,
  updateLearningProgress,
} from '../services/enrollment.service.js';
import { emitActionFailure } from '../services/notification-events.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function createEnrollmentHandler(req: Request, res: Response): Promise<Response> {
  try {
    const data = await enrollCourse(req.body, req.user!);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Enrollment created successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Dang ky khoa hoc that bai', 'Khong the enroll khoa hoc voi trang thai hien tai.', 'enrollment');
    throw error;
  }
}

export async function getMyEnrollmentsHandler(req: Request, res: Response): Promise<Response> {
  const data = await getMyEnrollments(req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Enrollments fetched successfully', data);
}

export async function getCourseEnrollmentsHandler(req: Request, res: Response): Promise<Response> {
  const data = await getCourseEnrollments(String(req.params.courseId), req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Course enrollments fetched successfully', data);
}

export async function updateLearningProgressHandler(req: Request, res: Response): Promise<Response> {
  const data = await updateLearningProgress(String(req.params.courseId), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Learning progress updated successfully', data);
}
