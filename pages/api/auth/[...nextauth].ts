import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      authorize(credentials: any, req) {
        return {
          ...credentials,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update") {
        return { ...token, ...session.user };
      }

      return {
        ...token,
        ...user,
      };
    },
    async session({ session, user, token }) {
      session.user.id = Number(token.id);
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.username = token.username;
      session.user.kelas = token.kelas;
      session.user.jabatan = token.jabatan;
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;

      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
