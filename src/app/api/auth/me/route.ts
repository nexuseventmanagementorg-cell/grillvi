import { NextResponse } from 'next/server';
import { getSessionAdmin } from '@/lib/auth';
import { getPersistentAdminUser } from '@/lib/adminCredentials';

export async function GET() {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const admin = await getPersistentAdminUser();

  return NextResponse.json({
    authenticated: true,
    user: {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
      lastLoginAt: admin.lastLoginAt,
    },
  });
}
