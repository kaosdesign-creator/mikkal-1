import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase'

function getUser(req: NextRequest) {
  try {
    const token = req.cookies.get('mikkal-token')?.value
    if (!token) return null
    return verify(token, process.env.NEXTAUTH_SECRET!) as any
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('conversations')
    .select('id, title, last_message, created_at, updated_at')
    .eq('user_id', user.userId)
    .order('updated_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ conversations: data || [] })
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()
  const { data } = await supabaseAdmin
    .from('conversations')
    .insert([{ user_id: user.userId, title: title || 'New Chat' }])
    .select()
    .single()

  return NextResponse.json({ conversation: data })
}

export async function DELETE(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.userId)

  return NextResponse.json({ success: true })
}
