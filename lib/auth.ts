import { compare, hash } from 'bcryptjs';
import { sign, verify, SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production.');
}
const JWT_SECRET_KEY = JWT_SECRET || 'dev-secret-key-for-local-testing';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  major?: string | null;
  cohort?: string | null;
  hasModuleAccess: boolean;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return sign(payload as object, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return verify(token, JWT_SECRET_KEY) as JWTPayload;
  } catch {
    return null;
  }
}



/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

/**
 * Get authentication token from cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  return token?.value || null;
}

/**
 * Get current authenticated user from request
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        major: true,
        cohort: true,
        hasModuleAccess: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Get current user from NextRequest (for API routes)
 */
export async function getCurrentUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        major: true,
        cohort: true,
        hasModuleAccess: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

/**
 * Require specific role - throws if not authenticated or wrong role
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error('Forbidden');
  }
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(UserRole.ADMIN);
}

/**
 * Require student role
 */
export async function requireStudent(): Promise<AuthUser> {
  return requireRole(UserRole.STUDENT);
}

/**
 * Check if user is authenticated (for API routes)
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUserFromRequest(request);
  return user !== null;
}

/**
 * Check if user has specific role (for API routes)
 */
export async function hasRole(request: NextRequest, role: UserRole): Promise<boolean> {
  const user = await getCurrentUserFromRequest(request);
  return user?.role === role;
}

/**
 * Validate registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  major?: string;
  cohort?: string;
}

const emailSchema = z.string().email();

export function validateRegistrationData(data: RegisterData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email validation
  if (!data.email || !emailSchema.safeParse(data.email).success) {
    errors.push('Invalid email format');
  } 

  // Password validation
  if (!data.password || data.password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Full name validation
  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create audit log entry
 */
export async function createAuditLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId?: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: actorId,
        action,
        resource: targetType,
        metadata: metadata || {},
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}
