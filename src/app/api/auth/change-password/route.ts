import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionAdmin,
  comparePassword,
  hashPassword,
  generateToken,
  ADMIN_COOKIE_CONFIG,
} from '@/lib/auth';
import { getPersistentAdminUser, savePersistentAdminUser } from '@/lib/adminCredentials';

export async function POST(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { currentPassword, newPassword, newUsername } = body ?? {};

    if (
      typeof currentPassword !== 'string' ||
      !currentPassword ||
      typeof newUsername !== 'string' ||
      !newUsername.trim()
    ) {
      return NextResponse.json(
        { error: 'Current password and username are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== undefined && typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'New password must be text.' },
        { status: 400 }
      );
    }

    if (newPassword && newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const username = newUsername.trim();
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 50 characters.' },
        { status: 400 }
      );
    }

    const admin = await getPersistentAdminUser();
    const isCurrentValid = comparePassword(currentPassword, admin.passwordHash);

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Incorrect current password.' },
        { status: 400 }
      );
    }

    if (!newPassword && username.toUpperCase() === admin.username.toUpperCase()) {
      return NextResponse.json(
        { error: 'Enter a new username or password to make a change.' },
        { status: 400 }
      );
    }

    const updatedAdmin = {
      ...admin,
      username,
      passwordHash:
        typeof newPassword === 'string' && newPassword
          ? hashPassword(newPassword)
          : admin.passwordHash,
      mustChangePassword: false,
    };
    await savePersistentAdminUser(updatedAdmin);

    const response = NextResponse.json({
      success: true,
      message: 'Admin login details updated successfully.',
      user: {
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        role: updatedAdmin.role,
      },
    });
    const token = generateToken({
      userId: updatedAdmin.id,
      username: updatedAdmin.username,
      role: updatedAdmin.role,
    });
    response.cookies.set(ADMIN_COOKIE_CONFIG.name, token, ADMIN_COOKIE_CONFIG.options);
    return response;
  } catch (err) {
    console.error('Password change error:', err);
    const errorMessage = err instanceof Error ? err.message : '';
    const isPersistenceNotConfigured = errorMessage.startsWith(
      'Configure Supabase persistence'
    );
    return NextResponse.json(
      {
        error: isPersistenceNotConfigured
          ? errorMessage
          : 'Failed to update password.',
      },
      { status: isPersistenceNotConfigured ? 503 : 500 }
    );
  }
}
