import { DashboardShell } from '../components/common/dashboard-shell';

const teacherNav = [
  { label: 'Dashboard', to: '/teacher/dashboard' },
  { label: 'Khoa hoc', to: '/teacher/courses' },
  { label: 'Mock tests', to: '/teacher/mock-tests' },
  { label: 'Hoc vien', to: '/teacher/students' },
  { label: 'Tin nhan', to: '/teacher/messages' },
];

export function TeacherLayout() {
  return <DashboardShell title="Teacher Workspace" accent="giang vien" navItems={teacherNav} />;
}
