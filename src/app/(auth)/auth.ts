import NextAuth, { DefaultSession } from 'next-auth';
import GitHub from 'next-auth/providers/github';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { dbPool } from '@/database/server/dbPool';
import { usersTable, accountsTable } from '@/database/schemas';
import { eq } from 'drizzle-orm';
import { createUser, getUserByEmail } from '@/database/server/queries';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  // interface Session extends DefaultSession {
  //   user: {
  //     id: string;
  //   } & DefaultSession['user'];
  // }
  // interface User {
  //   id?: string;
  //   email?: string | null;
  // }

  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    // type: UserType;
  }
}

const providers: Provider[] = [GitHub];

export const providerMap = providers
  .map(provider => {
    if (typeof provider === 'function') {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter(provider => provider.id !== 'credentials');

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // Credentials({
    //   credentials: {},
    //   authorize: async credentials => {
    //     console.log(credentials, 'credentials');
    //     return {
    //       id: '1',
    //       name: 'test',
    //       email: 'test@test.com',
    //     };
    //   },
    // }),
  ],
  // adapter: DrizzleAdapter(dbPool, {
  //   usersTable,
  //   accountsTable,
  // }),
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('signIn', user);
      // 检查用户是否存在
      if (account?.provider === 'github' && user.email) {
        try {
          // 查找用户
          const existingUser = await getUserByEmail(user.email);

          if (!existingUser) {
            console.log('Creating new user');
            // 创建随机密码（因为使用OAuth，所以密码不会被使用）
            const randomPassword = Math.random().toString(36).slice(-8);
            // 插入新用户
            const newUser = await createUser({
              name: user.name || 'User',
              email: user.email,
              password: randomPassword,
            });

            user.id = newUser[0].id;
            console.log('New user created');
          } else {
            console.log('User already exists');
            user.id = existingUser.id;
          }

          return true;
        } catch (error) {
          console.error('Error during user check/creation:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }

      return token;
    },

    // 这个回调会在每次创建 session 时被调用
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
      }

      return session;
    },
  },
});
