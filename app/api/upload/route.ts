import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { uploadAudio } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const user = await getCurrentUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Validate type (must be audio)
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type. Only audio is allowed.' }, { status: 400 });
    }

    // 3. Enforce size limit (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    // 4. Validate extension against whitelist
    const ALLOWED_EXTENSIONS = ['.webm', '.mp3', '.wav', '.m4a', '.ogg', '.aac'];
    let cleanedExt = path.extname(file.name).toLowerCase().split(';')[0];
    if (!cleanedExt.startsWith('.')) {
      cleanedExt = '.' + cleanedExt;
    }
    if (!ALLOWED_EXTENSIONS.includes(cleanedExt)) {
      return NextResponse.json({ error: 'Invalid file extension.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 5. Generate cryptographically secure unique file name
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileName = `${timestamp}_${randomString}${cleanedExt}`;

    // Upload via cloud storage (R2/S3) or fallback to local disk
    const { url, provider } = await uploadAudio(buffer, fileName, file.type);

    return NextResponse.json({ url, provider }, { status: 200 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
