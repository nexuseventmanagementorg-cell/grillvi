import { NextRequest, NextResponse } from 'next/server';
import { getSessionAdmin, comparePassword, hashPassword } from '@/lib/auth';
import { getAdminUser, updateAdminPassword } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const admin = getAdminUser();
    const isCurrentValid = comparePassword(currentPassword, admin.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Incorrect current password.' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);
    updateAdminPassword(newHash);

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('Password change error:', err);
    return NextResponse.json(
      { error: 'Failed to update password.' },
      { status: 500 }
    );
  }
}
