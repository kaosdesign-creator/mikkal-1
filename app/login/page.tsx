'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="font-bold text-xl text-gray-900">Mikkal</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign In →
        </button>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-cyan-700 text-sm font-medium">Private Access — Invite Only</span>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-2xl mx-auto">
            Everything you need.<br />
            <span className="text-cyan-500">One place.</span>
          </h1>

          <p className="text-gray-400 text-lg mb-12 max-w-md mx-auto">
            Your personal AI. Research, write, build, create — all in one beautifully simple interface.
          </p>

          <button
            onClick={() => router.push('/login')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-10 py-4 rounded-2xl text-lg transition-all duration-200 shadow-lg shadow-cyan-200"
          >
            Enter Mikkal
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-300 text-sm">
        © {new Date().getFullYear()} Mikkal — Private Access
      </footer>

    </main>
  )
}