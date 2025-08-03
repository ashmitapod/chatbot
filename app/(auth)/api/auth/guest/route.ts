import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isDevelopmentEnvironment } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    // Already authenticated, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Mock guest user session creation (no DB)
  const guestUser = {
    id: 'guest_user_' + Date.now(),
    email: null,
    type: 'guest',
  };

  // Create a token manually (JWT-based session)
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.set('next-auth.session-token', JSON.stringify({
    id: guestUser.id,
    type: guestUser.type,
  }), {
    httpOnly: true,
    path: '/',
  });

  console.log('✅ Guest user session created:', guestUser.id);

  return response;
}
