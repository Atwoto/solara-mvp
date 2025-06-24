// src/lib/auth.ts

import type { NextAuthOptions } from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';

// NO MORE PROVIDERS NEEDED HERE! Supabase handles it.

export const authOptions: NextAuthOptions = {
  // We still use the adapter to sync sessions, users, etc.
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  // The providers array is now empty because Supabase handles the sign-in flow.
  providers: [], 

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // This callback is still important to link the Supabase user to the NextAuth token.
    async session({ session, user }) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET;
      if (signingSecret) {
        // You can optionally sign a custom JWT here if needed for other services
      }
      // Link the session user ID to the user ID from the database
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
  },
};