import { UserSettingsPage } from '../shared/user-settings-page';

/** Personal account settings — distinct from /admin/settings (system/ops dashboard). */
export function AdminAccountSettingsPage() {
  return <UserSettingsPage />;
}
