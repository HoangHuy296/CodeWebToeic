import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../layouts/admin-layout';
import { AdminAuthLayout } from '../layouts/admin-auth-layout';
import { AuthLayout } from '../layouts/auth-layout';
import { MarketingLayout } from '../layouts/marketing-layout';
import { StudentLayout } from '../layouts/student-layout';
import { TeacherLayout } from '../layouts/teacher-layout';
import { AdminLoginPage } from '../pages/auth/admin-login-page';
import { LoginPage } from '../pages/auth/login-page';
import { RegisterPage } from '../pages/auth/register-page';
import { AdminCourseCreatePage } from '../pages/admin/admin-course-create-page';
import { AdminCoursesPage } from '../pages/admin/admin-courses-page';
import { AdminDashboardPage } from '../pages/admin/admin-dashboard-page';
import { AdminMessagesPage } from '../pages/admin/admin-messages-page';
import { AdminMockTestCreatePage } from '../pages/admin/admin-mock-test-create-page';
import { AdminMockTestEditorPage } from '../pages/admin/admin-mock-test-editor-page';
import { AdminMockTestsPage } from '../pages/admin/admin-mock-tests-page';
import { AdminPostsPage } from '../pages/admin/admin-posts-page';
import { AdminSettingsPage } from '../pages/admin/admin-settings-page';
import { AdminUsersPage } from '../pages/admin/admin-users-page';
import { BlogDetailPage } from '../pages/public/blog-detail-page';
import { BlogListPage } from '../pages/public/blog-list-page';
import { CourseDetailPage } from '../pages/public/course-detail-page';
import { CourseListPage } from '../pages/public/course-list-page';
import { HomePage } from '../pages/public/home-page';
import { MockTestLandingPage } from '../pages/public/mock-test-landing-page';
import { PortfolioPage } from '../pages/public/portfolio-page';
import { CourseLessonsManagePage } from '../pages/shared/course-lessons-manage-page';
import { StudentDashboardPage } from '../pages/student/student-dashboard-page';
import { StudentLearningPage } from '../pages/student/student-learning-page';
import { StudentMockTestsPage } from '../pages/student/student-mock-tests-page';
import { StudentMockTestSessionPage } from '../pages/student/student-mock-test-session-page';
import { StudentMessagesPage } from '../pages/student/student-messages-page';
import { StudentMyCoursesPage } from '../pages/student/student-my-courses-page';
import { StudentProfilePage } from '../pages/student/student-profile-page';
import { TeacherCoursesPage } from '../pages/teacher/teacher-courses-page';
import { TeacherDashboardPage } from '../pages/teacher/teacher-dashboard-page';
import { TeacherMessagesPage } from '../pages/teacher/teacher-messages-page';
import { TeacherMockTestCreatePage } from '../pages/teacher/teacher-mock-test-create-page';
import { TeacherMockTestEditorPage } from '../pages/teacher/teacher-mock-test-editor-page';
import { TeacherMockTestsPage } from '../pages/teacher/teacher-mock-tests-page';
import { TeacherStudentsPage } from '../pages/teacher/teacher-students-page';
import { NotFoundPage } from '../pages/system/not-found-page';
import { AdminAuthRedirectRoute } from './admin-auth-redirect';
import { AppRouteShell } from './app-route-shell';
import { AuthRedirectRoute } from './auth-redirect';
import { ProtectedRoute } from './protected-route';
import { RoleBasedRoute } from './role-based-route';

export const router = createBrowserRouter([
  {
    Component: AppRouteShell,
    children: [
      {
        path: '/admin/login',
        Component: AdminAuthRedirectRoute,
        children: [
          {
            Component: AdminAuthLayout,
            children: [{ index: true, Component: AdminLoginPage }],
          },
        ],
      },
      {
        path: '/',
        Component: MarketingLayout,
        children: [
          { index: true, Component: HomePage },
          { path: 'courses', Component: CourseListPage },
          { path: 'courses/:slug', Component: CourseDetailPage },
          { path: 'mock-test', Component: MockTestLandingPage },
          { path: 'blog', Component: BlogListPage },
          { path: 'blog/:slug', Component: BlogDetailPage },
          { path: 'portfolio', Component: PortfolioPage },
          {
            Component: AuthRedirectRoute,
            children: [
              {
                Component: AuthLayout,
                children: [
                  { path: 'login', Component: LoginPage },
                  { path: 'register', Component: RegisterPage },
                ],
              },
            ],
          },
          {
            Component: ProtectedRoute,
            children: [
              {
                element: <RoleBasedRoute allowedRoles={['student']} />,
                children: [
                  { path: 'student/mock-tests/:id', Component: StudentMockTestSessionPage },
                  { path: 'student/learn/:courseId', Component: StudentLearningPage },
                  {
                    path: 'student',
                    Component: StudentLayout,
                    children: [
                      { path: 'dashboard', Component: StudentDashboardPage },
                      { path: 'profile', Component: StudentProfilePage },
                      { path: 'messages', Component: StudentMessagesPage },
                      { path: 'my-courses', Component: StudentMyCoursesPage },
                      { path: 'mock-tests', Component: StudentMockTestsPage },
                    ],
                  },
                ],
              },
              {
                element: <RoleBasedRoute allowedRoles={['teacher']} />,
                children: [
                  { path: 'teacher/courses/:slug/lessons', Component: CourseLessonsManagePage },
                  { path: 'teacher/mock-tests/create', Component: TeacherMockTestCreatePage },
                  { path: 'teacher/mock-tests/:slug', Component: TeacherMockTestEditorPage },
                  { path: 'teacher/mock-tests/play/:slug', Component: StudentMockTestSessionPage },
                  {
                    path: 'teacher',
                    Component: TeacherLayout,
                    children: [
                      { path: 'dashboard', Component: TeacherDashboardPage },
                      { path: 'courses', Component: TeacherCoursesPage },
                      { path: 'mock-tests', Component: TeacherMockTestsPage },
                      { path: 'students', Component: TeacherStudentsPage },
                      { path: 'messages', Component: TeacherMessagesPage },
                    ],
                  },
                ],
              },
              {
                element: <RoleBasedRoute allowedRoles={['admin']} />,
                children: [
                  { path: 'admin/courses/:slug/lessons', Component: CourseLessonsManagePage },
                  { path: 'admin/mock-tests/create', Component: AdminMockTestCreatePage },
                  { path: 'admin/mock-tests/:slug', Component: AdminMockTestEditorPage },
                  {
                    path: 'admin',
                    Component: AdminLayout,
                    children: [
                      { path: 'dashboard', Component: AdminDashboardPage },
                      { path: 'users', Component: AdminUsersPage },
                      { path: 'courses', Component: AdminCoursesPage },
                      { path: 'courses/create', Component: AdminCourseCreatePage },
                      { path: 'mock-tests', Component: AdminMockTestsPage },
                      { path: 'posts', Component: AdminPostsPage },
                      { path: 'messages', Component: AdminMessagesPage },
                      { path: 'settings', Component: AdminSettingsPage },
                    ],
                  },
                ],
              },
            ],
          },
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
]);
