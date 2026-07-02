export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { UserStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  verifyPassword, 
  generateToken, 
  setAuthCookie,
  createAuditLog 
} from '@/lib/auth';
// In-memory rate limiting map for login attempts
// key: IP:email, value: { count: number, resetTime: number }
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;

  if (now > attempt.resetTime) {
    loginAttempts.delete(key);
    return false;
  }

  return attempt.count >= 5; // max 5 attempts per 15 minutes
}

function recordAttempt(key: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(key, { count: 1, resetTime: now + 15 * 60 * 1000 });
  } else {
    attempt.count += 1;
  }
}

function clearAttempts(key: string) {
  loginAttempts.delete(key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limitKey = `${ip}:${cleanEmail}`;

    if (isRateLimited(limitKey)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.' },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      recordAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      recordAttempt(limitKey);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Clear failed attempts upon successful login
    clearAttempts(limitKey);

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Create audit log
    await createAuditLog(
      user.id,
      'USER_LOGIN',
      'User',
      user.id,
      { email: user.email }
    );

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          major: user.major,
          cohort: user.cohort,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
