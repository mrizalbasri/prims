export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, UserStatus, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  hashPassword, 
  generateToken, 
  setAuthCookie, 
  validateRegistrationData,
  createAuditLog,
  type RegisterData 
} from '@/lib/auth';



export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();

    // Validate registration data
    const validation = validateRegistrationData(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Determine role based on email domain
    const emailDomain = body.email.split('@')[1]?.toLowerCase();
    const role = emailDomain?.includes('admin') ? UserRole.ADMIN : UserRole.STUDENT;

    // Hash password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        role,
        fullName: body.fullName.trim(),
        major: body.major?.trim() || null,
        cohort: body.cohort?.trim() || null,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        major: true,
        cohort: true,
        createdAt: true,
      },
    });

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
      'USER_REGISTERED',
      'User',
      user.id,
      { email: user.email, role: user.role }
    );

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          major: user.major,
          cohort: user.cohort,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
