import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyJwt(token: string, secret: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const encoder = new TextEncoder();
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const verified = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(signature) as Uint8Array,
      encoder.encode(`${header}.${payload}`)
    );

    if (!verified) return null;

    const decodedPayload = new TextDecoder().decode(base64UrlDecode(payload));
    const parsed = JSON.parse(decodedPayload);

    if (parsed.exp && typeof parsed.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (now >= parsed.exp) return null;
    }

    return parsed;
  } catch (err) {
    console.error('JWT Edge verification failed:', err);
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const loginUrl = new URL('/login', request.url);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production.');
  }
  const jwtSecret = secret || 'dev-secret-key-for-local-testing';
  const payload = await verifyJwt(token, jwtSecret);

  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
