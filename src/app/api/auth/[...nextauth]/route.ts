import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'
import type { NextAuthOptions } from 'next-auth'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- THE FIX: The 'export' keyword has been REMOVED from this line ---
const authOptions: NextAuthOptions = {
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
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;
            const { data: user } = await supabaseAdmin.from('users').select('*').eq('email', credentials.email).single();
            if (user) return { id: user.id, name: user.name, email: user.email, image: user.image };
            return null;
        }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
              // @ts-ignore
              email: user.email!,
          });
          
          let authUser = users[0];

          if (!authUser) {
              const { data: { user: newAuthUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
                  email: user.email!,
                  email_confirm: true,
                  user_metadata: { name: user.name, avatar_url: user.image }
              });
              if (createError) throw createError;
              authUser = newAuthUser!;
          }

          if (!authUser) throw new Error("Could not find or create auth user.");

          await supabaseAdmin.from('users').upsert({
                id: authUser.id,
                name: user.name,
                email: user.email,
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
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
};

// These two lines correctly export what Vercel needs
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };