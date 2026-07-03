import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Only this account may ever sign in as admin.
// Kept as an env var so the email isn't hardcoded into source control.
const ALLOWED_EMAIL = process.env.ADMIN_EMAIL; // set this to banghozin@gmail.com in .env

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Reject every account except the whitelisted one.
      if (!ALLOWED_EMAIL) return false;
      return user.email?.toLowerCase() === ALLOWED_EMAIL.toLowerCase();
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    // custom sign-in page so a rejected login shows a clear message
    // instead of NextAuth's default error screen
    signIn: "/admin",
    error: "/admin",
  },
};
