import { DashboardShell } from '../components/common/dashboard-shell';

const adminNav = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Nguoi dung', to: '/admin/users' },
  {
    label: 'Khoa hoc',
    to: '/admin/courses',
    children: [{ label: 'Tao khoa hoc', to: '/admin/courses/create' }],
  },
  {
    label: 'Mock tests',
    to: '/admin/mock-tests',
    children: [{ label: 'Tao bai thi', to: '/admin/mock-tests/create' }],
  },
  { label: 'Posts', to: '/admin/posts' },
  { label: 'Messages', to: '/admin/messages' },
  { label: 'Settings', to: '/admin/settings' },
];

export function AdminLayout() {
  return <DashboardShell title="Admin Control" accent="quan tri" navItems={adminNav} />;
}
