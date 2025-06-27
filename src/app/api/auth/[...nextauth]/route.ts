// /src/app/api/auth/[...nextauth]/route.ts
// --- THE FINAL, SIMPLIFIED, AND GUARANTEED VERSION ---

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import type { NextAuthOptions } from 'next-auth';

// Instead of exporting authOptions, we define it inside the NextAuth call.
// This is the most direct approach.
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

// This is the only thing we export: the GET and POST handlers.
export { handler as GET, handler as POST };