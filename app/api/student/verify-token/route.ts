export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest } from '@/lib/auth';



import { getTeacherTokens } from '@/lib/settings';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { token } = await request.json();

    const validTokens = await getTeacherTokens();
    if (!token || !validTokens.includes(token.trim().toUpperCase())) {
      return NextResponse.json({ error: 'Token tidak valid. Silakan tanya dosen Anda.' }, { status: 400 });
    }

    // Update user to have module access
    await prisma.user.update({
      where: { id: user.id },
      data: { hasModuleAccess: true }
    });

    return NextResponse.json(
      { message: 'Akses modul berhasil dibuka!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
