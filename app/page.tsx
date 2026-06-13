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
        <div style={{ fontFamily: 'var(--font-orbitron), Orbitron, sans-serif', fontSize: 72, color: '#1a1a1a', lineHeight: 1, display: 'flex', alignItems: 'center', letterSpacing: 0 }}>
          <span style={{ fontWeight: 400 }}>M</span>
          <span style={{ fontWeight: 400 }}>I</span>
          <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
          <span style={{ fontWeight: 900 }}>K</span>
          <span style={{ fontWeight: 400 }}>A</span>
          <span style={{ fontWeight: 400 }}>L</span>
        </div>

        {/* Tagline */}
        <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 11, letterSpacing: 3, fontWeight: 500, color: '#666', marginTop: 12 }}>INVITE ONLY</p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 20, marginTop: 44 }}>
          {(['register', 'signin'] as Mode[]).map((m) => (
            <button key={m} onClick={() => openMode(mode === m ? 'none' : m)} style={{ fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif', fontSize: 11, letterSpacing: 3, border: '1.5px solid #1a1a1a', borderRadius: 999, padding: '13px 30px', background: mode === m ? '#1a1a1a' : 'transparent', color: mode === m ? 'white' : '#1a1a1a', cursor: 'pointer', transition: 'all 0.2s' }}>
              {m === 'register' ? 'REGISTER' : 'SIGN IN'}
            </button>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif', fontSize: 10, letterSpacing: 3, color: '#666', marginTop: 12 }}>INVITE ONLY</p>

        {/* Inline form */}
        {mode !== 'none' && (
          <div style={{ width: '100%', background: 'white', borderRadius: 20, border: '1px solid #ddd', padding: 28, marginTop: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
           <p style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: 12, letterSpacing: 3, fontWeight: 600, color: '#444', textAlign: 'center', marginBottom: 20 }}>
              {mode === 'signin' ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
            </p>
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
