import type { AdminUser } from '@/types';
import { getAdminUser, updateAdminCredentials } from '@/lib/db';
import {
  isPersistentSettingsConfigured,
  readPersistentSetting,
  writePersistentSetting,
} from '@/lib/persistentSettings';

const ADMIN_CREDENTIALS_KEY = 'grillvi_admin_credentials';

export async function getPersistentAdminUser(): Promise<AdminUser> {
  if (!isPersistentSettingsConfigured()) {
    return getAdminUser();
  }

  const storedAdmin = await readPersistentSetting<AdminUser>(ADMIN_CREDENTIALS_KEY);
  if (storedAdmin) return storedAdmin;

  const initialAdmin = getAdminUser();
  await writePersistentSetting(ADMIN_CREDENTIALS_KEY, initialAdmin);
  return initialAdmin;
}

export async function savePersistentAdminUser(admin: AdminUser): Promise<void> {
  if (isPersistentSettingsConfigured()) {
    await writePersistentSetting(ADMIN_CREDENTIALS_KEY, admin);
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configure Supabase persistence before changing admin credentials.');
  }

  updateAdminCredentials(admin.username, admin.passwordHash);
}
