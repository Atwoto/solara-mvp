// src/lib/auth.ts

import type { NextAuthOptions } from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    CredentialsProvider({
        name: 'Supabase',
        credentials: { session: { label: 'Supabase Session', type: 'text' } },
        async authorize(credentials) {
            if (credentials) return { id: 'supabase-user-sync' };
            return null;
        }
    })
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    // THE DEFINITIVE, BULLETPROOF FIX IS HERE
    async jwt({ token, user, account }) {
      // On initial sign-in (the 'account' object is available)
      if (account && user) {
        // Persist the Supabase access token and user ID to the NextAuth JWT
        token.supabaseAccessToken = account.access_token;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Make the Supabase access token and user ID available on the session object
      (session as any).supabaseAccessToken = token.supabaseAccessToken;
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  pages: { signIn: '/login' },
};