import { useTranslation } from 'react-i18next';
import { DashboardShell } from '../components/common/dashboard-shell';

export function StudentLayout() {
  const { t } = useTranslation('navigation');

  const studentNav = [
    { label: t('common.dashboard'), to: '/student/dashboard' },
    { label: t('common.profile'), to: '/student/profile' },
    { label: t('common.messages'), to: '/student/messages' },
    { label: t('student.myCourses'), to: '/student/my-courses' },
    { label: t('student.results'), to: '/student/results' },
    { label: t('student.wordcheckResults'), to: '/student/wordcheck-results' },
    { label: t('student.mockTests'), to: '/student/mock-tests' },
    { label: t('common.settings'), to: '/student/settings' },
  ];

  return <DashboardShell title={t('student.workspaceTitle')} accent={t('student.accent')} navItems={studentNav} />;
}
