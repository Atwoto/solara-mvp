// src/lib/auth.ts

import type { NextAuthOptions } from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    // This dummy provider is our bridge for syncing the Supabase session with NextAuth.
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
    // THE CRITICAL FIX IS HERE: Enriching the JWT
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!; // Use `sub` (subject) from the token as the user ID
      }
      // Pass the Supabase access token to the session object
      (session as any).supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        // On a new sign-in, persist the Supabase access token to the NextAuth JWT.
        token.supabaseAccessToken = account.access_token;
      }
      if (user) {
        token.sub = user.id; // Ensure the user ID is in the token's subject
      }
      return token;
    },
  },
  
  pages: { signIn: '/login' },
};