// src/lib/auth.ts

import type { NextAuthOptions } from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';

// The unnecessary 'jsonwebtoken' import has been REMOVED.

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    // This dummy provider is our bridge for syncing the Supabase session with NextAuth.
    CredentialsProvider({
        name: 'Supabase',
        credentials: {
            session: { label: 'Supabase Session', type: 'text' },
        },
        async authorize(credentials) {
            if (credentials) {
                return { id: 'supabase-user-sync' }; 
            }
            return null;
        }
    })
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // The session callback adds the user ID from the token to the final session object.
    async session({ session, token }) {
      if (session.user) {
        // Use `sub` (subject) from the JWT as the user ID
        session.user.id = token.sub!; 
      }
      // Pass the Supabase access token to the session object
      (session as any).supabaseAccessToken = token.supabaseAccessToken;
      return session;
    },
    // The JWT callback enriches the token with the Supabase access token.
    async jwt({ token, user, account }) {
      if (user) {
        // On initial sign-in, ensure the user ID is in the token's subject
        token.sub = user.id;
      }
      if (account) {
        // Persist the Supabase access token to the NextAuth JWT.
        token.supabaseAccessToken = account.access_token;
      }
      return token;
    },
  },
  
  pages: {
    signIn: '/login',
  },
};