// /src/app/api/auth/[...nextauth]/route.ts
// --- THE FINAL, DIRECT, AND BULLETPROOF VERSION ---

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import type { NextAuthOptions } from 'next-auth'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Find or create the official Supabase auth user
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ email: user.email! });
          let authUser = users[0];
          if (!authUser) {
            const { data: { user: newAuthUser } } = await supabaseAdmin.auth.admin.createUser({
              email: user.email!,
              email_confirm: true,
              user_metadata: { name: user.name, avatar_url: user.image }
            });
            authUser = newAuthUser!;
          }
          if (!authUser) throw new Error("Could not find or create auth user.");

          // Create or update the public profile in public.profiles
          await supabaseAdmin.from('profiles').upsert({
            id: authUser.id,
            name: user.name,
            image: user.image,
          });
          
          user.id = authUser.id;
          return true;
        } catch (e) {
          console.error("Auth callback error:", e);
          return false; // This is what triggers the `error=Callback`
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };