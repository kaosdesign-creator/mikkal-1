import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
  const scope = 'openid email profile'
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=select_account`
  return NextResponse.redirect(url)
}