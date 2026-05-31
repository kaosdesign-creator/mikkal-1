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

  const { searchParams } = new URL(req.url)
  const conversationId = searchParams.get('conversationId')
  if (!conversationId) return NextResponse.json({ error: 'No conversation ID' }, { status: 400 })

  const { data } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.userId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ messages: data || [] })
}
