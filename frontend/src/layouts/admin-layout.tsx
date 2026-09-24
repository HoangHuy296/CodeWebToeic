import { useTranslation } from 'react-i18next';
import { DashboardShell } from '../components/common/dashboard-shell';

export function AdminLayout() {
  const { t } = useTranslation('navigation');

  const adminNav = [
    { label: t('common.dashboard'), to: '/admin/dashboard' },
    { label: t('admin.users'), to: '/admin/users' },
    {
      label: t('admin.courses'),
      to: '/admin/courses',
      children: [{ label: t('admin.createCourse'), to: '/admin/courses/create' }],
    },
    {
      label: t('admin.mockTests'),
      to: '/admin/mock-tests',
      children: [{ label: t('admin.createMockTest'), to: '/admin/mock-tests/create' }],
    },
    {
      label: t('admin.exercises'),
      to: '/admin/exercises',
      children: [
        { label: t('admin.exerciseTopics'), to: '/admin/exercises' },
        { label: t('admin.exerciseWorkspace'), to: '/admin/exercises/items' },
      ],
    },
    { label: t('admin.results'), to: '/admin/results' },
    { label: t('admin.wordcheckResults'), to: '/admin/resultswordcheck' },
    { label: t('admin.posts'), to: '/admin/posts' },
    { label: t('common.messages'), to: '/admin/messages' },
    { label: t('admin.systemSettings'), to: '/admin/settings' },
    { label: t('admin.accountSettings'), to: '/admin/account-settings' },
  ];

  return <DashboardShell title={t('admin.workspaceTitle')} accent={t('admin.accent')} navItems={adminNav} />;
}
