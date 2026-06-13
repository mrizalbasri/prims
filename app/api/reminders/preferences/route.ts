export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, UserRole, ReminderCadence, ReminderChannel, SectionType, VocabularyCategory, QuestionDifficulty, ResponseStatus, SectionStatus, TestAttemptStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';



// GET: Get user's reminder preferences
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preference = await prisma.reminderPreference.findUnique({
      where: { userId: user.id },
    });

    if (!preference) {
      return NextResponse.json(
        {
          hasPreference: false,
          message: 'No reminder preference set',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        hasPreference: true,
        preference: {
          isActive: preference.isActive,
          cadence: preference.cadence,
          channel: preference.channel,
          timeOfDay: preference.timeOfDay,
          timezone: preference.timezone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reminder preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update reminder preferences
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isActive, cadence, channel, timeOfDay, timezone } = body;

    // Validate cadence
    if (cadence && !Object.values(ReminderCadence).includes(cadence)) {
      return NextResponse.json(
        { error: 'Invalid cadence value' },
        { status: 400 }
      );
    }

    // Validate channel
    if (channel && !Object.values(ReminderChannel).includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel value' },
        { status: 400 }
      );
    }

    // Validate timeOfDay format (HH:MM)
    if (timeOfDay && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeOfDay)) {
      return NextResponse.json(
        { error: 'Invalid timeOfDay format. Use HH:MM (e.g., 09:00)' },
        { status: 400 }
      );
    }

    // Upsert preference
    const preference = await prisma.reminderPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        isActive: isActive ?? true,
        cadence: cadence || ReminderCadence.DAILY,
        channel: channel || ReminderChannel.EMAIL,
        timeOfDay: timeOfDay || '09:00',
        timezone: timezone || 'Asia/Jakarta',
      },
      update: {
        isActive: isActive !== undefined ? isActive : undefined,
        cadence: cadence || undefined,
        channel: channel || undefined,
        timeOfDay: timeOfDay || undefined,
        timezone: timezone || undefined,
      },
    });

    await createAuditLog(
      user.id,
      'REMINDER_PREFERENCE_UPDATED',
      'ReminderPreference',
      preference.id,
      { isActive: preference.isActive, cadence: preference.cadence }
    );

    return NextResponse.json(
      {
        message: 'Reminder preferences updated successfully',
        preference: {
          isActive: preference.isActive,
          cadence: preference.cadence,
          channel: preference.channel,
          timeOfDay: preference.timeOfDay,
          timezone: preference.timezone,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update reminder preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Disable reminders
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.reminderPreference.update({
      where: { userId: user.id },
      data: { isActive: false },
    });

    await createAuditLog(
      user.id,
      'REMINDER_DISABLED',
      'ReminderPreference',
      user.id
    );

    return NextResponse.json(
      { message: 'Reminders disabled successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Disable reminders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
