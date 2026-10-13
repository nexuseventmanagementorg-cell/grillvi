import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser, recordAdminLogin } from '@/lib/db';
import {
  comparePassword,
  generateToken,
  ADMIN_COOKIE_CONFIG,
  checkRateLimit,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`login_${ip}`, 5, 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 1 minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const admin = getAdminUser();

    // Check username (case-insensitive for convenience)
    if (admin.username.toUpperCase() !== username.trim().toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = comparePassword(password, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    recordAdminLogin();

    const token = generateToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        mustChangePassword: admin.mustChangePassword,
      },
    });

    response.cookies.set(
      ADMIN_COOKIE_CONFIG.name,
      token,
      ADMIN_COOKIE_CONFIG.options
    );

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
