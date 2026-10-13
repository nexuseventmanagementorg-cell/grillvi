const SETTINGS_KEY = 'system_settings';

function getSupabaseSettingsUrl(): string | null {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url && !serviceRoleKey) {
    return null;
  }

  if (!url || !serviceRoleKey) {
    throw new Error('Set both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  return `${url.replace(/\/+$/, '')}/rest/v1/${SETTINGS_KEY}`;
}

export function isPersistentSettingsConfigured(): boolean {
  return getSupabaseSettingsUrl() !== null;
}

export async function readPersistentSetting<T>(key: string): Promise<T | null> {
  const baseUrl = getSupabaseSettingsUrl();
  if (!baseUrl) return null;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const query = new URLSearchParams({
    key: `eq.${key}`,
    select: 'value',
    limit: '1',
  });
  const response = await fetch(`${baseUrl}?${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase settings read failed (${response.status}).`);
  }

  const rows = (await response.json()) as Array<{ value: T }>;
  return rows[0]?.value ?? null;
}

export async function writePersistentSetting<T>(key: string, value: T): Promise<void> {
  const baseUrl = getSupabaseSettingsUrl();
  if (!baseUrl) {
    throw new Error('Persistent settings are not configured. Set up Supabase first.');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const response = await fetch(`${baseUrl}?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify([
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
    ]),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Supabase settings save failed (${response.status}).`);
  }
}
