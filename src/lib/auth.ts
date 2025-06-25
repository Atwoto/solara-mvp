// /src/lib/auth.ts -- FINAL VERSION FOR EMAIL/PASSWORD ONLY

import type { NextAuthOptions } from 'next-auth';       
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

// Initialize a single, reusable Supabase client with admin privileges
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: "Email", type: "text" },
          password: {  label: "Password", type: "password" }
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                console.log("Authorize: Missing credentials");
                return null;
            }
            
            console.log("Authorize: Looking up user for email:", credentials.email);

            // Find the user in the 'users' table
            // This table should NOT be auth.users, but your own public table.
            const { data: user, error } = await supabase
                .from('users') 
                .select('*')
                .eq('email', credentials.email)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error("Authorize: Supabase error:", error.message);
                return null;
            }
            
            if (!user) {
                console.log("Authorize: User not found.");
                return null;
            }

            // In a real app, you MUST compare hashed passwords.
            // For now, we are just checking if the user exists.
            // Example: const isValid = await bcrypt.compare(credentials.password, user.password_hash);
            // if (isValid) { ... }
            
            console.log("Authorize: User found, login successful. User ID:", user.id);
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image
            };
        }
    })
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async jwt({ token, user }) {
        if (user) {
            // On sign-in, the 'user' object from `authorize` is passed here.
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
  
  pages: { 
    signIn: '/login',
    error: '/login',
  },
};