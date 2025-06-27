// lib/auth.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials!

        // ⚠️ Aqui você coloca sua lógica de autenticação
        const user = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())

        if (user && user.id) {
          return user
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/login' // ou a página que você quiser usar como login
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user
      return token
    },
    async session({ session, token }) {
      if (token?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user = token.user as any
      }
      return session
    }
  }
}
