import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate type (must be audio)
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type. Only audio is allowed.' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const originalExt = path.extname(file.name) || '.webm';
    // Clean extension (e.g., in some browsers mediaRecorder produces audio/webm;codecs=opus)
    let cleanedExt = originalExt.split(';')[0];
    if (!cleanedExt.startsWith('.')) {
      cleanedExt = '.' + cleanedExt;
    }
    const fileName = `${timestamp}_${randomString}${cleanedExt}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/audio/${fileName}`;
    return NextResponse.json({ url: relativeUrl }, { status: 200 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Internal server error during upload' }, { status: 500 });
  }
}
