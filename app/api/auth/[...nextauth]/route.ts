import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

const APPROVED_USERS = [
  {
    id: '1',
    name: 'Brent Theyson',
    email: 'btheyson1968@gmail.com',
    password: '$2a$10$a4UcdCDX7RvZD7PGCt1g8OSObAsBRUPmz4CVkP45URMnsR48j8Gv.',
    role: 'admin',
    note: 'Welcome home, Brent. This is yours.',
  },
]

const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Mikkal',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = APPROVED_USERS.find(
          u => u.email.toLowerCase() === credentials.email.toLowerCase()
        )
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return { id: user.id, name: user.name, email: user.email, role: user.role, note: user.note }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.note = (user as any).note }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).note = token.note
        ;(session.user as any).id   = token.sub
      }
      return session
    },
  },
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(options)
export { handler as GET, handler as POST }