import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http-status.js';
import {
  createCourse,
  createLesson,
  deleteCourse,
  deleteLesson,
  getCourseBySlug,
  listCourses,
  listManageCourses,
  updateCourse,
  updateLesson,
} from '../services/course.service.js';
import { emitActionFailure } from '../services/notification-events.service.js';
import { sendSuccess } from '../utils/api-response.js';

export async function getCourses(_req: Request, res: Response): Promise<Response> {
  const data = await listCourses();
  return sendSuccess(res, HTTP_STATUS.OK, 'Courses fetched successfully', data);
}

export async function getManageCoursesHandler(req: Request, res: Response): Promise<Response> {
  const data = await listManageCourses(req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Manage courses fetched successfully', data);
}

export async function getCourseDetail(req: Request, res: Response): Promise<Response> {
  const data = await getCourseBySlug(String(req.params.slug), req.user);
  return sendSuccess(res, HTTP_STATUS.OK, 'Course fetched successfully', data);
}

export async function createCourseHandler(req: Request, res: Response): Promise<Response> {
  try {
    const data = await createCourse(req.body, req.user!);
    return sendSuccess(res, HTTP_STATUS.CREATED, 'Course created successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Tao khoa hoc that bai', 'Khong the tao khoa hoc voi du lieu vua nhap.', 'course');
    throw error;
  }
}

export async function updateCourseHandler(req: Request, res: Response): Promise<Response> {
  try {
    const data = await updateCourse(String(req.params.id), req.body, req.user!);
    return sendSuccess(res, HTTP_STATUS.OK, 'Course updated successfully', data);
  } catch (error) {
    emitActionFailure(req.user!, 'Cap nhat khoa hoc that bai', 'Khong the thay doi trang thai hoac noi dung khoa hoc.', 'course');
    throw error;
  }
}

export async function deleteCourseHandler(req: Request, res: Response): Promise<Response> {
  await deleteCourse(String(req.params.id));
  return sendSuccess(res, HTTP_STATUS.OK, 'Course deleted successfully', {});
}

export async function createLessonHandler(req: Request, res: Response): Promise<Response> {
  const data = await createLesson(String(req.params.courseId), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.CREATED, 'Lesson created successfully', data);
}

export async function updateLessonHandler(req: Request, res: Response): Promise<Response> {
  const data = await updateLesson(String(req.params.id), req.body, req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Lesson updated successfully', data);
}

export async function deleteLessonHandler(req: Request, res: Response): Promise<Response> {
  await deleteLesson(String(req.params.id), req.user!);
  return sendSuccess(res, HTTP_STATUS.OK, 'Lesson deleted successfully', {});
}
