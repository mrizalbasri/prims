export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest, createAuditLog } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { violationType, section, details } = body;

    await createAuditLog(
      user.id,
      'TEST_VIOLATION_DETECTED',
      'TestAttempt',
      user.id,
      {
        violationType: violationType || 'TAB_SWITCH',
        section: section || 'unknown',
        details: details || null,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Log violation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
