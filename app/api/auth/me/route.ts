import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('mikkal-token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any
    return NextResponse.json({ user: { id: decoded.userId, email: decoded.email, role: decoded.role } })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}
