import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'grillvi_admin_token';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters.');
  }
  return secret;
}

export interface AdminTokenPayload {
  userId: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// In-memory rate limiting map: ip -> { count, firstRequestTimestamp }
const rateLimitMap = new Map<string, { count: number; firstTimestamp: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { count: 1, firstTimestamp: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  const windowMs = windowSeconds * 1000;
  if (now - entry.firstTimestamp > windowMs) {
    // Window expired, reset counter
    rateLimitMap.set(key, { count: 1, firstTimestamp: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

export function hashPassword(plainText: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainText, salt);
}

export function comparePassword(plainText: string, hash: string): boolean {
  return bcrypt.compareSync(plainText, hash);
}

export function generateToken(payload: { userId: string; username: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): AdminTokenPayload | null {
  const secret = getJwtSecret();
  try {
    return jwt.verify(token, secret) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export async function getSessionAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const ADMIN_COOKIE_CONFIG = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
};
