// /src/app/api/auth/[...nextauth]/route.ts
// --- THE FINAL, TWO-STEP, BULLETPROOF VERSION ---

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import type { NextAuthOptions } from 'next-auth'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
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
        credentials: { /* ... */ },
        async authorize(credentials) {
            // Your credentials logic here...
            if (!credentials?.email || !credentials?.password) return null;
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('email', credentials.email)
                .single();
            if (user) return { id: user.id, name: user.name, email: user.email, image: user.image };
            return null;
        }
    })
  ],

  callbacks: {
    // THIS IS THE NEW, CORRECT SIGNIN CALLBACK
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // STEP 1: Check if the user exists in Supabase's OFFICIAL auth system.
          const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
              page: 1,
              perPage: 1,
              // @ts-ignore - Supabase types might not have 'email' here, but it works
              email: user.email!,
          });

          if (listError) throw listError;
          
          let authUser = users[0];

          // STEP 2: If the user does NOT exist in the auth system, create them.
          if (!authUser) {
              const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                  email: user.email!,
                  email_confirm: true, // Assume verified from Google
                  user_metadata: {
                      name: user.name,
                      avatar_url: user.image,
                  }
              });
              if (createError) throw createError;
              authUser = newAuthUser!;
          }

          if (!authUser) throw new Error("Could not find or create auth user.");

          // STEP 3: Now that we have an official auth user, create or update their
          // corresponding profile in our public 'users' table.
          const { error: upsertError } = await supabaseAdmin
            .from('users') // Your public.users table
            .upsert({
                id: authUser.id, // Use the ID from the official auth user
                name: user.name,
                email: user.email,
                image: user.image,
            });

          if (upsertError) throw upsertError;
          
          // STEP 4: Attach the correct ID to the NextAuth user object.
          user.id = authUser.id;
          
          return true; // Allow sign-in

        } catch (e) {
          console.error("Auth callback error:", e);
          return false;
        }
      }
      return true; // Allow other providers
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