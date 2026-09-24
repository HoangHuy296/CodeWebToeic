import { useTranslation } from 'react-i18next';
import { DashboardShell } from '../components/common/dashboard-shell';

export function TeacherLayout() {
  const { t } = useTranslation('navigation');

  const teacherNav = [
    { label: t('common.dashboard'), to: '/teacher/dashboard' },
    { label: t('common.profile'), to: '/teacher/profile' },
    { label: t('teacher.courses'), to: '/teacher/courses' },
    { label: t('teacher.exercises'), to: '/teacher/exercises/items' },
    { label: t('teacher.mockTests'), to: '/teacher/mock-tests' },
    { label: t('teacher.results'), to: '/teacher/results' },
    { label: t('teacher.students'), to: '/teacher/students' },
    { label: t('common.messages'), to: '/teacher/messages' },
    { label: t('common.settings'), to: '/teacher/settings' },
  ];

  return <DashboardShell title={t('teacher.workspaceTitle')} accent={t('teacher.accent')} navItems={teacherNav} />;
}
