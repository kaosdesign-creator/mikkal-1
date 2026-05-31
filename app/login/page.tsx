'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    <div className="min-h-screen bg-[#eeedea] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="text-4xl tracking-widest text-gray-900 mb-2"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span style={{ fontWeight: 400 }}>MI</span>
            <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
            <span style={{ fontWeight: 900 }}>K</span>
            <span style={{ fontWeight: 400 }}>AL</span>
          </div>
          <p className="text-xs text-gray-400 tracking-widest" style={{ fontFamily: "'Bungee Hairline', sans-serif" }}>
            {mode === 'login' ? 'SIGN IN TO CONTINUE' : 'CREATE YOUR ACCOUNT'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Invite Code</label>
              <input
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors font-mono tracking-widest"
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition-colors mt-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-gray-400 pt-1">
            {mode === 'login' ? (
              <>Have an invite code?{' '}
                <button onClick={() => { setMode('register'); setError('') }} className="text-gray-700 underline">
                  Create account
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError('') }} className="text-gray-700 underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 tracking-widest" style={{ fontFamily: "'Bungee Hairline', sans-serif" }}>
          INVITE ONLY · PRIVATE ACCESS
        </p>
      </div>
    </div>
  )
}
