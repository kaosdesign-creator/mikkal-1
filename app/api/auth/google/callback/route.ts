import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sign } from 'jsonwebtoken'
export const runtime = 'nodejs'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    if (!code) return NextResponse.redirect(new URL('/?error=no_code', req.url))
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) return NextResponse.redirect(new URL('/?error=token_failed', req.url))
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser = await userRes.json()
    if (!googleUser.email) return NextResponse.redirect(new URL('/?error=no_email', req.url))
    let { data: user } = await supabaseAdmin.from('users').select('*').eq('email', googleUser.email.toLowerCase()).single()
    if (!user) {
      const { data: newUser } = await supabaseAdmin.from('users')
        .insert([{ email: googleUser.email.toLowerCase(), name: googleUser.name, password_hash: 'GOOGLE_OAUTH', role: 'user' }])
        .select().single()
      user = newUser
    }
    if (!user) return NextResponse.redirect(new URL('/?error=user_failed', req.url))
    const token = sign({ userId: user.id, email: user.email, role: user.role }, process.env.NEXTAUTH_SECRET!, { expiresIn: '30d' })
    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.set('mikkal-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
    return res
  } catch (err) {
    console.error('GOOGLE AUTH ERROR:', err)
    return NextResponse.redirect(new URL('/?error=auth_failed', req.url))
  }
}