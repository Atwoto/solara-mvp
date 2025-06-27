// /src/app/api/auth/[...nextauth]/route.ts
// --- FINAL, MINIMAL, AND ROBUST VERSION ---

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import type { NextAuthOptions } from 'next-auth';

// We do NOT create a global client here.
// We will create it inside the callbacks where it's needed.
// This is more reliable in a serverless environment.

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
        name: 'Credentials',
        credentials: { /* your credentials config */ },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;
            // Create a new client instance just for this authorization
            const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
            const { data: profile } = await supabase.from('profiles').select('*').eq('email', credentials.email).single();
            if (profile) return { id: profile.id, name: profile.name, email: profile.email, image: profile.image };
            return null;
        }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Create a new Supabase client instance every time signIn is called.
          // This is the safest way to ensure the connection is fresh and uses the correct env vars.
          const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

          // Use the auth.admin API to find or create the user
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) throw new Error(`Supabase listUsers error: ${listError.message}`);

          let authUser = users.find(u => u.email === user.email);

          if (!authUser) {
            const { data: { user: newAuthUser }, error: createError } = await supabase.auth.admin.createUser({
              email: user.email!,
              email_confirm: true,
              user_metadata: { name: user.name, avatar_url: user.image }
            });
            if (createError) throw new Error(`Supabase createUser error: ${createError.message}`);
            authUser = newAuthUser!;
          }
          if (!authUser) throw new Error("Could not find or create Supabase auth user.");

          // Create or update the corresponding public profile
          const { error: upsertError } = await supabase.from('profiles').upsert({
            id: authUser.id,
            name: user.name,
            image: user.image,
          });
          if (upsertError) throw new Error(`Supabase upsert profile error: ${upsertError.message}`);
          
          user.id = authUser.id;
          return true; // Success!

        } catch (e: any) {
          // This is the most important part. We will now see the REAL error in the Vercel logs.
          console.error("FATAL SIGNIN CALLBACK ERROR:", e.message);
          return false; // Return false to trigger the generic 'Callback' error page
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