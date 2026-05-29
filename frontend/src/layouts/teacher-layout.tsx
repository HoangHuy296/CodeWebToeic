import { DashboardShell } from '../components/common/dashboard-shell';

const teacherNav = [
  { label: 'Dashboard', to: '/teacher/dashboard' },
  { label: 'Ho so', to: '/teacher/profile' },
  { label: 'Khoa hoc', to: '/teacher/courses' },
  { label: 'Bai tap', to: '/teacher/exercises/items' },
  { label: 'Mock tests', to: '/teacher/mock-tests' },
  { label: 'Ket qua bai lam', to: '/teacher/results' },
  { label: 'Hoc vien', to: '/teacher/students' },
  { label: 'Tin nhan', to: '/teacher/messages' },
];

export function TeacherLayout() {
  return <DashboardShell title="Teacher Workspace" accent="giang vien" navItems={teacherNav} />;
}
