import viCommon from './locales/vi/common.json';
import viSettings from './locales/vi/settings.json';
import viNavigation from './locales/vi/navigation.json';
import viAuth from './locales/vi/auth.json';
import viPublic from './locales/vi/public.json';
import viWordcheck from './locales/vi/wordcheck.json';
import viPortfolio from './locales/vi/portfolio.json';
import viWorkspace from './locales/vi/workspace.json';
import viAdmin from './locales/vi/admin.json';
import viStudent from './locales/vi/student.json';
import viTeacher from './locales/vi/teacher.json';
import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enPublic from './locales/en/public.json';
import enWordcheck from './locales/en/wordcheck.json';
import enPortfolio from './locales/en/portfolio.json';
import enWorkspace from './locales/en/workspace.json';
import enAdmin from './locales/en/admin.json';
import enStudent from './locales/en/student.json';
import enTeacher from './locales/en/teacher.json';

/**
 * Bundled at build time (not lazy-loaded) so switching languages never depends on a network
 * request — see docs/language-en-vi-plan.md's "Cách render đa ngôn ngữ" section.
 */
export const resources = {
  vi: {
    common: viCommon,
    settings: viSettings,
    navigation: viNavigation,
    auth: viAuth,
    public: viPublic,
    wordcheck: viWordcheck,
    workspace: viWorkspace,
    student: viStudent,
    teacher: viTeacher,
    admin: viAdmin,
    portfolio: viPortfolio,
  },
  en: {
    common: enCommon,
    settings: enSettings,
    navigation: enNavigation,
    auth: enAuth,
    public: enPublic,
    wordcheck: enWordcheck,
    workspace: enWorkspace,
    student: enStudent,
    teacher: enTeacher,
    admin: enAdmin,
    portfolio: enPortfolio,
  },
} as const;

export const defaultNS = 'common';
