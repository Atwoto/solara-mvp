// src/lib/auth.ts

import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

interface AppUser extends NextAuthUser {
  id: string;
  email: string;
}

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // --- THE DEFINITIVE FIX IS HERE ---
      // This object makes the OAuth request more explicit and robust,
      // which is often required for production environments like Vercel.
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AppUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data: signInResponse, error: signInError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (signInError) {
          console.error("Supabase credentials sign-in error:", signInError.message);
          return null;
        }
        const supabaseUser = signInResponse?.user;
        if (supabaseUser && supabaseUser.id && supabaseUser.email) {
          return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.full_name || null,
            image: supabaseUser.user_metadata?.avatar_url || null,
          };
        }
        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || undefined;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error', 
  },

  debug: process.env.NODE_ENV === 'development',
};