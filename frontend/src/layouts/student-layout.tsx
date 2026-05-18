import { DashboardShell } from '../components/common/dashboard-shell';

const studentNav = [
  { label: 'Dashboard', to: '/student/dashboard' },
  { label: 'Ho so', to: '/student/profile' },
  { label: 'Tin nhan', to: '/student/messages' },
  { label: 'Khoa hoc cua toi', to: '/student/my-courses' },
  { label: 'Luyen thi', to: '/student/mock-tests' },
];

export function StudentLayout() {
  return <DashboardShell title="Student Workspace" accent="hoc vien" navItems={studentNav} />;
}
