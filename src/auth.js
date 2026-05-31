import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { db } from "@/lib/db";
import { users, organizations, orgMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID || process.env.META_CLIENT_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET || process.env.META_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "email,public_profile,instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
        },
      },
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.orgId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
      }
      
      if (account && account.provider === "facebook") {
        token.facebookAccessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.orgId = token.orgId;
        session.user.facebookAccessToken = token.facebookAccessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "credentials") return true;

      // Handle OAuth sign in: Create or update user in database
      const email = user.email;
      if (!email) return false;

      let [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!existingUser) {
        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            name: user.name || email.split("@")[0],
            role: "manager",
            avatarUrl: user.image,
            isSample: false,
          })
          .returning();
        
        existingUser = newUser;
      } else if (user.image && !existingUser.avatarUrl) {
        // Update user avatar
        await db
          .update(users)
          .set({ avatarUrl: user.image, updatedAt: new Date() })
          .where(eq(users.id, existingUser.id));
      }

      user.id = existingUser.id;
      user.role = existingUser.role;
      user.orgId = existingUser.orgId;

      return true;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
