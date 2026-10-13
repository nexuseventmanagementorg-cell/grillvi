import { NextResponse } from 'next/server';
import { getSessionAdmin } from '@/lib/auth';
import { getAdminUser } from '@/lib/db';

export async function GET() {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const admin = getAdminUser();

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
