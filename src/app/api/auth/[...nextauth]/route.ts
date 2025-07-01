// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';
import type { NextAuthOptions } from 'next-auth';

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
        credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
        
        // --- THIS IS THE SECURE, CORRECTED AUTHORIZE FUNCTION ---
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) {
                throw new Error("Email and password are required.");
            }

            // Use the standard Supabase client for sign-in, not the admin client
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            
            // 1. Let Supabase handle the password check securely
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            // 2. If Supabase returns an error (e.g., wrong password, user not found), throw an error.
            //    NextAuth will catch this and pass the error message to the login form.
            if (error) {
                console.error("Supabase sign-in error:", error.message);
                throw new Error("Invalid email or password. Please try again.");
            }

            // 3. If login is successful, Supabase returns the user object.
            //    We can now return the user details to NextAuth to create the session.
            if (data.user) {
                return {
                    id: data.user.id,
                    name: data.user.user_metadata.name,
                    email: data.user.email,
                    image: data.user.user_metadata.avatar_url,
                };
            }
            
            // This should not be reached if Supabase is working correctly, but as a fallback:
            return null;
        }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // ... (Your Google sign-in logic is good and does not need to change) ...
        try {
          const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          let authUser = users.find(u => u.email === user.email);
          if (!authUser) {
              const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                  email: user.email!, email_confirm: true, user_metadata: { name: user.name, avatar_url: user.image }
              });
              if (createError) throw createError;
              authUser = newAuthUser!;
          }
          if (!authUser) throw new Error("Could not find or create auth user.");
          await supabaseAdmin.from('users').upsert({
                id: authUser.id, name: user.name, email: user.email, image: user.image,
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
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
  pages: {
      signIn: '/login', // Direct users to your custom login page
  }
});

export { handler as GET, handler as POST };