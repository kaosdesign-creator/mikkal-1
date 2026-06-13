import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('mikkal-token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const decoded = verify(token, process.env.NEXTAUTH_SECRET!) as any

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .eq('id', decoded.userId)
      .single()

    if (!user) return NextResponse.json({ user: null }, { status: 401 })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null }, { status: 401 })
  }
}