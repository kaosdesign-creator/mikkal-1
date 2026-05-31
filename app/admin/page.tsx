'use client'
import { useState, useEffect } from 'react'
import { Copy, Check, Trash2, Plus, RefreshCw } from 'lucide-react'

export default function AdminPage() {
  const [data, setData] = useState<{ codes: any[]; users: any[] }>({ codes: [], users: [] })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(1)
  const [copied, setCopied] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin')
    if (res.ok) setData(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    })
    if (res.ok) await load()
    setGenerating(false)
  }

  const deleteCode = async (code: string) => {
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    await load()
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const unusedCodes = data.codes?.filter(c => !c.used_by && c.active) || []
  const usedCodes = data.codes?.filter(c => c.used_by) || []

  return (
    <div className="min-h-screen bg-[#f5f4f1]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mikkal Admin</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage invite codes and users</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">← Dashboard</a>
            <button onClick={load} className="text-gray-400 hover:text-gray-700 transition-colors ml-2">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Generate codes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Generate Invite Codes</h2>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center outline-none focus:border-gray-400"
            />
            <span className="text-sm text-gray-500">code{count !== 1 ? 's' : ''}</span>
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={14} />
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Available codes */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Available Codes ({unusedCodes.length})</h2>
          {unusedCodes.length === 0 ? (
            <p className="text-sm text-gray-400">No unused codes. Generate some above.</p>
          ) : (
            <div className="space-y-2">
              {unusedCodes.map(c => (
                <div key={c.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <code className="flex-1 font-mono text-sm font-bold text-gray-800 tracking-widest">{c.code}</code>
                  <button onClick={() => copy(c.code)} className="text-gray-400 hover:text-gray-700 transition-colors">
                    {copied === c.code ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                  </button>
                  <button onClick={() => deleteCode(c.code)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Users ({data.users?.length || 0})</h2>
          {!data.users?.length ? (
            <p className="text-sm text-gray-400">No users yet.</p>
          ) : (
            <div className="space-y-2">
              {data.users.map(u => (
                <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.name || u.email}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Used codes */}
        {usedCodes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Used Codes ({usedCodes.length})</h2>
            <div className="space-y-2">
              {usedCodes.map(c => (
                <div key={c.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
                  <code className="flex-1 font-mono text-sm text-gray-500 tracking-widest line-through">{c.code}</code>
                  <span className="text-xs text-gray-400">{c.users?.email}</span>
                  <span className="text-xs text-gray-400">{new Date(c.used_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
