// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth/next';
import type { 
    NextAuthOptions, 
    User as NextAuthUser, 
    Account,          
    Profile,          
    Session as NextAuthSession 
} from 'next-auth';       
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import type { JWT } from 'next-auth/jwt'; 

// --- START OF FIX: Read environment variables into constants BEFORE they are used ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
// --- END OF FIX ---


// Local AppUser interface
interface AppUser extends NextAuthUser {
  id: string;
  email: string;
}

export const authOptions: NextAuthOptions = {
  // Pass the constants directly to the adapter.
  // We also add a check to ensure the adapter is only configured if the keys exist.
  adapter: SupabaseAdapter({
    url: supabaseUrl!, // Pass the constant, the '!' asserts it's not undefined
    secret: supabaseServiceRoleKey!,
  }),

  providers: [
    // Add a check to only include the provider if its keys are defined
    ...(googleClientId && googleClientSecret ? [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      })
    ] : []),
    
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
        // Use the public URL key for the client-side sign-in method
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
        token.email = user.email;
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

// Add a check before initializing NextAuth
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in the environment. NextAuth adapter will fail.");
    // In a real build, you might want this to throw an error to fail the build.
    // throw new Error("Missing Supabase configuration for NextAuth Adapter.");
}
if (!googleClientId || !googleClientSecret) {
    console.warn("WARN: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not defined. Google provider will be disabled.");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };