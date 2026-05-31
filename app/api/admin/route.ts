import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('mikkal-token')?.value
    if (!token) return null
    return verify(token, process.env.NEXTAUTH_SECRET!) as any
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: codes } = await supabaseAdmin
    .from('invite_codes')
    .select('*, users(email, name)')
    .order('created_at', { ascending: false })

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, email, name, created_at, role')
    .order('created_at', { ascending: false })

  return NextResponse.json({ codes, users })
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { count = 1 } = await req.json()
  const codes = []

  for (let i = 0; i < Math.min(count, 50); i++) {
    const code = uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()
    codes.push({ code })
  }

  const { data } = await supabaseAdmin.from('invite_codes').insert(codes).select()
  return NextResponse.json({ codes: data })
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req)
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  await supabaseAdmin.from('invite_codes').delete().eq('code', code)
  return NextResponse.json({ success: true })
}
