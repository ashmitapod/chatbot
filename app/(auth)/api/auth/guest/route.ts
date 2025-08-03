import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/auth/auth'; 
// Ensure this path is correct (alias to auth.ts or use next-auth/client)

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  // Sign in with the 'guest' provider (mock guest user)
  await signIn('guest', { redirect: false });

  // Manually redirect after signIn
  return NextResponse.redirect(redirectUrl);
}
