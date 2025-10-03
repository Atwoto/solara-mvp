import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const bcrypt = require("bcryptjs");
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email.toLowerCase())
          .single();

        if (user && user.password) {
          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isValidPassword) {
            return {
              id: user.id,
              email: user.email,
              name: user.name || user.email,
            };
          }
        }
        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("SignIn callback triggered:", {
        provider: account?.provider,
        email: user.email,
        userId: user.id,
      });

      if (account?.provider === "google") {
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        try {
          // Check if user exists
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Error fetching user:", fetchError);
            return false;
          }

          if (!existingUser) {
            // Use the Google user ID to maintain consistency
            const userId = user.id || generateUUID();

            const userData = {
              id: userId,
              email: user.email!,
              name: user.name || null,
              image: user.image || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            console.log("Creating new user with data:", userData);

            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert([userData])
              .select()
              .single();

            if (insertError) {
              console.error("Error creating user:", insertError);
              console.error("Insert data:", userData);

              // If it's a duplicate key error, try to fetch the existing user
              if (insertError.code === "23505") {
                const { data: retryUser } = await supabase
                  .from("users")
                  .select("*")
                  .eq("email", user.email)
                  .single();

                if (retryUser) {
                  console.log("Found existing user on retry:", retryUser.id);
                  user.id = retryUser.id;
                  return true;
                }
              }
              return false;
            }

            console.log("User created successfully:", newUser);
            user.id = newUser.id;
          } else {
            console.log("Existing user found:", existingUser.id);
            user.id = existingUser.id;
          }

          // Double-check that the user exists in database
          const { data: verifyUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", user.id)
            .single();

          if (!verifyUser) {
            console.error(
              "User verification failed - user not found in database"
            );
            return false;
          }

          console.log("User verification successful:", verifyUser.id);
          return true;
        } catch (error) {
          console.error("Unexpected error in signIn callback:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", {
        id: user.id,
        email: user.email,
        provider: account?.provider,
      });
    },
  },

  debug: process.env.NODE_ENV === "development",
};
