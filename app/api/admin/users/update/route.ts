export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';
import { UserStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await getCurrentUserFromRequest(request);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, status, hasModuleAccess, resetTest } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Verify student exists and has role STUDENT
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only student accounts can be updated' }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {};
    if (status === 'ACTIVE' || status === 'SUSPENDED') {
      updateData.status = status as UserStatus;
    }
    if (typeof hasModuleAccess === 'boolean') {
      updateData.hasModuleAccess = hasModuleAccess;
    }

    if (resetTest === true) {
      await prisma.testAttempt.deleteMany({
        where: { userId },
      });
      updateData.hasModuleAccess = false;
    }

    if (Object.keys(updateData).length === 0 && resetTest !== true) {
      return NextResponse.json({ error: 'No update parameters provided' }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        hasModuleAccess: true,
        cohort: true,
        major: true,
      },
    });

    await createAuditLog(
      adminUser.id,
      'USER_UPDATED',
      'User',
      userId,
      updateData
    );

    return NextResponse.json(
      {
        message: 'User updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
