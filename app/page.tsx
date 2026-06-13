'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'none' | 'signin' | 'register'

export default function LandingPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('none')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setError(''); setEmail(''); setPassword(''); setName(''); setInviteCode(''); setShowPassword(false) }
  const openMode = (m: Mode) => { reset(); setMode(m) }
const signInWithGoogle = () => { window.location.href = '/api/auth/google' }
  const submit = async () => {
    setError('')
    if (!email || !password) return setError('Please fill in all fields')
    if (mode === 'register' && !inviteCode) return setError('Invite code required')
    setLoading(true)
    try {
      const res = await fetch(mode === 'signin' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'signin' ? { email, password } : { email, password, name, inviteCode }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Something went wrong')
      if (mode === 'register') { reset(); setMode('signin'); setError('✓ Account created — sign in below') }
      else router.push('/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eeedea', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative', padding: '60px 20px 100px' }}>
      

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 480 }}>
        
        {/* Wordmark */}
        <div style={{ fontFamily: 'var(--font-orbitron), Orbitron, sans-serif', fontSize: 72, color: '#1a1a1a', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 400 }}>M</span>
          <span style={{ fontWeight: 400 }}>I</span>
          <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
          <span style={{ fontWeight: 900 }}>K</span>
          <span style={{ fontWeight: 400 }}>A</span>
          <span style={{ fontWeight: 400 }}>L</span>
        </div>

        {/* Tagline */}
        <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, letterSpacing: 3, fontWeight: 500, color: '#666', marginTop: 12 }}>WISDOM &nbsp;·&nbsp; INSIGHT &nbsp;·&nbsp; INTELLIGENCE</p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 20, marginTop: 44 }}>
          {(['register', 'signin'] as Mode[]).map((m) => (
            <button key={m} onClick={() => openMode(mode === m ? 'none' : m)}
              style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, border: '1.5px solid #1a1a1a', borderRadius: 999, padding: '13px 30px', width: 140, textAlign: 'center', background: mode === m ? '#1a1a1a' : 'transparent', color: mode === m ? 'white' : '#1a1a1a', cursor: 'pointer', transition: 'all 0.2s' }}>
              {m === 'register' ? 'REGISTER' : 'SIGN IN'}
            </button>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, letterSpacing: 3, fontWeight: 500, color: '#666', marginTop: 12 }}>INVITE ONLY</p>

        {/* Inline form */}
        {mode !== 'none' && (
          <div style={{ width: '100%', background: 'white', borderRadius: 20, border: '1px solid #ddd', padding: 28, marginTop: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
           <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, letterSpacing: 3, fontWeight: 600, color: '#444', textAlign: 'center', marginBottom: 20 }}>
              {mode === 'signin' ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
            </p>
            <button onClick={signInWithGoogle}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font-inter), sans-serif', color: '#374151', cursor: 'pointer', marginBottom: 16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'var(--font-inter), sans-serif' }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>NAME</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>EMAIL</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && submit()} style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 10, padding: '11px 42px 11px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, display: 'flex' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>INVITE CODE</label>
                  <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="XXXXXXXX" style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'monospace', letterSpacing: 4, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
              {error && <p style={{ fontSize: 12, color: error.startsWith('✓') ? '#16a34a' : '#dc2626', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{error}</p>}
              <button onClick={submit} disabled={loading} style={{ width: '100%', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, marginTop: 4 }}>
                {loading ? 'Please wait...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif' }}>
                {mode === 'signin' ? <>Have an invite code?{' '}<button onClick={() => openMode('register')} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Register</button></> : <>Already have an account?{' '}<button onClick={() => openMode('signin')} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>Sign in</button></>}
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center', fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, letterSpacing: 3, fontWeight: 500, color: '#777', zIndex: 1, position: 'relative' }}>
        © MIKKAL &nbsp;·&nbsp; PRIVATE ACCESS
      </div>
    </div>
  )
}
