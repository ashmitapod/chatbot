import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Allow all authentication routes
      if (nextUrl.pathname.startsWith('/api/auth')) {
        return true;
      }
      
      // Always allow access - handle authentication in middleware
      return true;
    },
  },
} satisfies NextAuthConfig;
