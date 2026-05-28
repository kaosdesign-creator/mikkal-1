'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-brand-navy overflow-hidden flex flex-col items-center justify-center noise">

      {/* Glow background */}
      <div className="absolute inset-0 bg-mikkal-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-cyan opacity-[0.04] blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-brand-charcoal border border-brand-border flex items-center justify-center glow-cyan animate-pulse-glow">
            <span className="font-display font-800 text-3xl text-brand-cyan">M</span>
          </div>
        </motion.div>

        {/* Wordmark */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="font-display font-800 text-7xl tracking-tight text-brand-white mb-4"
        >
          Mikkal
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-brand-muted text-xl font-body mb-2"
        >
          Everything you need.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-brand-cyan text-xl font-body mb-12"
        >
          One place.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => router.push('/login')}
            className="mikkal-btn-primary text-lg px-10 py-4 glow-cyan"
          >
            Sign In
          </button>
        </motion.div>

        {/* Invite only note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-8 text-brand-muted text-sm"
        >
          Mikkal is currently invite-only.
        </motion.p>
      </div>

      {/* Bottom brand line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 text-brand-muted text-xs font-body"
      >
        © {new Date().getFullYear()} Mikkal — Private Access
      </motion.div>
    </main>
  )
}
