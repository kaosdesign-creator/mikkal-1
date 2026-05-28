import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

// Use this to generate hashed passwords for your users
// Visit: /api/hash?password=YourPassword123
// Copy the hash into the APPROVED_USERS list
export async function GET(req: NextRequest) {
  const password = req.nextUrl.searchParams.get('password')
  if (!password) return NextResponse.json({ error: 'No password provided' })
  const hash = await bcrypt.hash(password, 10)
  return NextResponse.json({ hash })
}
