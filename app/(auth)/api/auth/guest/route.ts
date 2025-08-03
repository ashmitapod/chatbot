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

  // Create a mock guest user session (No DB involved)
  const guestUser = {
    id: 'guest_' + Date.now(),
    email: `guest_${Date.now()}@guest.local`,  // Important for token parsing
    type: 'guest',
  };

  // Manually set a session token cookie
  const response = NextResponse.redirect(new URL(redirectUrl, request.url));
  response.cookies.set('next-auth.session-token', JSON.stringify(guestUser), {
    httpOnly: true,
    path: '/',
    secure: !isDevelopmentEnvironment,
  });

  console.log('✅ Guest user session created:', guestUser.id);

  return response;
}
