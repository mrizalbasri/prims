import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserStatus } from '@/app/generated/prisma';
import { 
  verifyPassword, 
  generateToken, 
  setAuthCookie,
  createAuditLog 
} from '@/lib/auth';

const prisma = new PrismaClient();

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

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
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
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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