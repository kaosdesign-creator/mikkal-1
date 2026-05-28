'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Search, FileText, Image, Code, Share2 } from 'lucide-react'

const FEATURES = [
  { icon: Zap,      label: 'AI Chat',      desc: 'Ask anything, get real answers' },
  { icon: Search,   label: 'Research',     desc: 'Live web search and analysis' },
  { icon: FileText, label: 'Documents',    desc: 'Word, Excel, PDF — all formats' },
  { icon: Image,    label: 'Images',       desc: 'Generate and edit visuals' },
  { icon: Code,     label: 'Code',         desc: 'Write and run any language' },
  { icon: Share2,   label: 'Social',       desc: 'Create and schedule posts' },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">M</span>
          </div>
          <span className="font-display font-bold text-xl text-gray-900">Mikkal</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="mk-btn text-sm px-5 py-2.5"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-700 text-sm font-medium">Private Access — Invite Only</span>
          </div>

          <h1 className="font-display font-extrabold text-6xl text-gray-900 leading-tight mb-6">
            Everything you need.<br />
            <span className="text-cyan-500">One place.</span>
          </h1>

          <p className="text-gray-500 text-xl mb-4 font-body">
            Wisdom. Insight. Intelligence.
          </p>

          <p className="text-gray-400 text-base mb-12 font-body max-w-lg mx-auto">
            Your personal AI that can research, write, build, create images, manage documents, and post to social — all in one beautifully simple interface.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="mk-btn text-lg px-12 py-4"
          >
            Enter Mikkal
          </button>
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="mk-card p-5 hover:border-cyan-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-cyan-600" />
                </div>
                <p className="font-display font-semibold text-gray-900 mb-1">{f.label}</p>
                <p className="text-gray-500 text-sm font-body">{f.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-gray-400 text-sm font-body">
        © {new Date().getFullYear()} Mikkal — Private Access
      </footer>
    </main>
  )
}
