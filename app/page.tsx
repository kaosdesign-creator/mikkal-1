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

  const reset = () => {
    setError('')
    setEmail('')
    setPassword('')
    setName('')
    setInviteCode('')
    setShowPassword(false)
  }

  const openMode = (m: Mode) => {
    reset()
    setMode(m)
  }

  const submit = async () => {
    setError('')
    if (!email || !password) return setError('Please fill in all fields')
    if (mode === 'register' && !inviteCode) return setError('Invite code required')
    setLoading(true)

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'signin'
        ? { email, password }
        : { email, password, name, inviteCode }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Something went wrong')

      if (mode === 'register') {
        reset()
        setMode('signin')
        setError('Account created! Please sign in.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#eeedea',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Raven watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 680,
        height: 680,
        opacity: 0.08,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <img
          src="/raven.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(100%)' }}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 480, padding: '0 24px' }}>

        {/* Wordmark */}
        <div style={{
          fontFamily: 'var(--font-orbitron), Orbitron, sans-serif',
          fontSize: 72,
          letterSpacing: '7.2px',
          color: '#1a1a1a',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          userSelect: 'none',
        }}>
          <span style={{ fontWeight: 400 }}>M</span>
          <span style={{ fontWeight: 400 }}>I</span>
          <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
          <span style={{ fontWeight: 900 }}>K</span>
          <span style={{ fontWeight: 400 }}>A</span>
          <span style={{ fontWeight: 400 }}>L</span>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
          fontSize: 11,
          letterSpacing: 4,
          color: '#888',
          marginTop: 16,
          textAlign: 'center',
        }}>
          WISDOM &nbsp;·&nbsp; INSIGHT &nbsp;·&nbsp; INTELLIGENCE
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 24, marginTop: 48 }}>
          <button
            onClick={() => openMode(mode === 'register' ? 'none' : 'register')}
            style={{
              fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
              fontSize: 12,
              letterSpacing: 3,
              color: mode === 'register' ? '#eeedea' : '#1a1a1a',
              background: mode === 'register' ? '#1a1a1a' : 'transparent',
              border: '1.5px solid #1a1a1a',
              borderRadius: 999,
              padding: '13px 32px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            REGISTER
          </button>
          <button
            onClick={() => openMode(mode === 'signin' ? 'none' : 'signin')}
            style={{
              fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
              fontSize: 12,
              letterSpacing: 3,
              color: mode === 'signin' ? '#eeedea' : '#1a1a1a',
              background: mode === 'signin' ? '#1a1a1a' : 'transparent',
              border: '1.5px solid #1a1a1a',
              borderRadius: 999,
              padding: '13px 32px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            SIGN IN
          </button>
        </div>

        {/* INVITE ONLY */}
        <p style={{
          fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
          fontSize: 10,
          letterSpacing: 3,
          color: '#aaa',
          marginTop: 12,
        }}>
          INVITE ONLY
        </p>

        {/* Inline form */}
        {mode !== 'none' && (
          <div style={{
            width: '100%',
            background: 'white',
            borderRadius: 20,
            border: '1px solid #e0e0e0',
            padding: 32,
            marginTop: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <p style={{
              fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
              fontSize: 11,
              letterSpacing: 3,
              color: '#555',
              marginBottom: 20,
              textAlign: 'center',
            }}>
              {mode === 'signin' ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>NAME</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '12px 44px 12px 16px', fontSize: 14, color: '#111', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 6, fontFamily: 'Inter, sans-serif', letterSpacing: 1 }}>INVITE CODE</label>
                  <input
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXXXXXX"
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', background: 'white', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 4 }}
                  />
                </div>
              )}

              {error && (
                <p style={{ fontSize: 12, color: error.includes('created') ? '#16a34a' : '#dc2626', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{error}</p>
              )}

              <button
                onClick={submit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: 1,
                  marginTop: 4,
                }}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif' }}>
                {mode === 'signin' ? (
                  <>Have an invite code?{' '}
                    <button onClick={() => openMode('register')} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                      Register
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => openMode('signin')} style={{ background: 'none', border: 'none', color: '#1a1a1a', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif',
        fontSize: 10,
        letterSpacing: 3,
        color: '#aaa',
      }}>
        © MIKKAL &nbsp;·&nbsp; PRIVATE ACCESS
      </div>
    </div>
  )
}
