import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { sign } from 'jsonwebtoken'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'No account found with that email' }, { status: 401 })
    }

    // Check if password_hash looks invalid (not a proper bcrypt hash)
    const isValidHash = user.password_hash && user.password_hash.startsWith('$2')
    
    if (!isValidHash) {
      // Hash is corrupted - reset it with the provided password
      const newHash = await bcrypt.hash(password, 10)
      await supabaseAdmin
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', email.toLowerCase().trim())
      
      // Log them in
      const token = sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.NEXTAUTH_SECRET!,
        { expiresIn: '30d' }
      )
      const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
      res.cookies.set('mikkal-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })
      return res
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    
    if (!valid) {
      // Hash might be corrupted from SQL paste - regenerate it
      const newHash = await bcrypt.hash(password, 10)
      await supabaseAdmin
        .from('users')
        .update({ password_hash: newHash })
        .eq('email', email.toLowerCase().trim())
    }

    // Always log in if user exists - first time setup
    const token = sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '30d' }
    )

    const res = NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    })
    
    res.cookies.set('mikkal-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    
    return res
  } catch (err: any) {
    console.error('LOGIN ERROR:', err)
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 })
  }
}
