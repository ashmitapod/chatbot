import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { guestLogin } from '@/app/(auth)/actions';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    // Already authenticated, redirect to the intended URL
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  try {
    // Use the guest login action
    const result = await guestLogin();
    
    if (result.status === 'success') {
      console.log('✅ Guest user session created via action');
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } else {
      console.error('Failed to create guest session');
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Error during guest login:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
