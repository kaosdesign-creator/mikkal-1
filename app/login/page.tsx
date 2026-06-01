'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    if (!email || !password) return setError('Please fill in all fields')
    if (mode === 'register' && !inviteCode) return setError('Invite code required')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
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
        setMode('login')
        setError('')
        setInviteCode('')
        alert('Account created! Please sign in.')
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-orbitron), sans-serif',
            fontSize: 36,
            letterSpacing: '7.2px',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontWeight: 400 }}>M</span>
            <span style={{ fontWeight: 400 }}>I</span>
            <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
            <span style={{ fontWeight: 900 }}>K</span>
            <span style={{ fontWeight: 400 }}>A</span>
            <span style={{ fontWeight: 400 }}>L</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-bungee), sans-serif',
            fontSize: 10,
            letterSpacing: 4,
            color: '#999',
            marginTop: 8,
          }}>
            {mode === 'login' ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid #f0f0f0',
          padding: 32,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 44px 12px 16px', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Invite Code</label>
                <input
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: 4 }}
                />
              </div>
            )}

            {error && (
              <p style={{ fontSize: 12, color: '#ef4444', textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={submit}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6b7280' : '#111827',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '13px 0',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                fontFamily: 'var(--font-inter), sans-serif',
              }}
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
              {mode === 'login' ? (
                <>Have an invite code?{' '}
                  <button onClick={() => { setMode('register'); setError('') }} style={{ background: 'none', border: 'none', color: '#374151', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                    Create account
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'none', border: 'none', color: '#374151', textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 10,
          letterSpacing: 3,
          color: '#bbb',
          marginTop: 24,
          fontFamily: 'var(--font-bungee), sans-serif',
        }}>
          INVITE ONLY · PRIVATE ACCESS
        </p>
      </div>
    </div>
  )
}
