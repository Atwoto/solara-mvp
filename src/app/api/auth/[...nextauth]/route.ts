// /src/app/api/auth/[...nextauth]/route.ts
// --- THE FINAL, SIMPLIFIED, AND GUARANTEED TO BUILD VERSION ---

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import type { NextAuthOptions } from 'next-auth';

// Define the handler directly, passing the options object inside.
// This avoids exporting the options object, which was causing the build to fail.
const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;
            const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('email', credentials.email).single();
            if (profile) return { id: profile.id, name: profile.name, email: profile.email, image: profile.image };
            return null;
        }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          let authUser = users.find(u => u.email === user.email);

          if (!authUser) {
            const { data: { user: newAuthUser } } = await supabaseAdmin.auth.admin.createUser({
              email: user.email!,
              email_confirm: true,
              user_metadata: { name: user.name, avatar_url: user.image }
            });
            authUser = newAuthUser!;
          }
          if (!authUser) throw new Error("Could not find or create Supabase auth user.");

          await supabaseAdmin.from('profiles').upsert({
            id: authUser.id,
            name: user.name,
            image: user.image,
          });
          
          user.id = authUser.id;
          return true;
        } catch (e) {
          console.error("Auth callback error:", e);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});

// This is the ONLY thing we export.
export { handler as GET, handler as POST };