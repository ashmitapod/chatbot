import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET, // <--- This line has been added
  ...authConfig,
  providers: [
    // Regular login (disabled for now)
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        console.error('Regular login is disabled (no DB)');
        return null;
      },
    }),
    // Guest login (No DB)
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const guestUser = {
          id: 'guest_user_' + Date.now(),
          email: null,
          type: 'guest' as UserType,
        };

        console.log('✅ Guest user created:', guestUser.id);
        return guestUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
});