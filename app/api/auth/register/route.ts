import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode, name } = await req.json()
    if (!email || !password || !inviteCode) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Check invite code
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode.toUpperCase())
      .eq('active', true)
      .is('used_by', null)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invalid or already used invite code' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    // Hash password
    const password_hash = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{ email: email.toLowerCase(), password_hash, name, invite_code: inviteCode.toUpperCase() }])
      .select()
      .single()

    if (userError) throw userError

    // Mark invite code as used
    await supabaseAdmin
      .from('invite_codes')
      .update({ used_by: user.id, used_at: new Date().toISOString(), active: false })
      .eq('code', inviteCode.toUpperCase())

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('REGISTER ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
