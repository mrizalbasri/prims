export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get current user before clearing cookie
    const user = await getCurrentUserFromRequest(request);

    // Clear auth cookie
    await clearAuthCookie();

    // Create audit log if user was authenticated
    if (user) {
      await createAuditLog(
        user.id,
        'USER_LOGOUT',
        'User',
        user.id,
        { email: user.email }
      );
    }

    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
