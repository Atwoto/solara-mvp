// /src/app/api/auth/[...nextauth]/route.ts
// --- THE FINAL, STRUCTURALLY CORRECT VERSION ---

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { SupabaseAdapter } from '@next-auth/supabase-adapter'
import type { NextAuthOptions } from 'next-auth'

// 1. Define your authOptions object. This part is correct.
export const authOptions: NextAuthOptions = {
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
};

// 2. Create the NextAuth handler by passing the options to the NextAuth function.
const handler = NextAuth(authOptions);

// 3. Export the handler for the GET and POST methods. This is the required structure.
export { handler as GET, handler as POST };