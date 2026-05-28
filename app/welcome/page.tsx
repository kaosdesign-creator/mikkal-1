'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 21) return 'Good evening'
  return 'Hey, night owl'
}

function getDaySub() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const day  = days[new Date().getDay()]
  if (day === 'Friday')                      return "Happy Friday — the weekend's almost here."
  if (day === 'Saturday' || day === 'Sunday') return `Enjoy your ${day}.`
  return "Let's see what we can build today."
}

export default function WelcomePage() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const [show, setShow]       = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated')  setTimeout(() => setShow(true), 100)
  }, [status, router])

  const handleEnter = () => {
    setLeaving(true)
    setTimeout(() => router.push('/dashboard'), 600)
  }

  if (!show) return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Friend'
  const note      = (session?.user as any)?.note || "You're here because you matter. Make yourself at home."
  const greeting  = getGreeting()
  const daySub    = getDaySub()

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-amber-50 flex flex-col items-center justify-center px-6"
    >
      <div className="max-w-md w-full flex flex-col items-center text-center gap-5">

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-200 border-4 border-white"
        >
          <span className="font-display font-extrabold text-3xl text-white">
            {firstName[0]?.toUpperCase()}
          </span>
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-gray-500 text-lg font-body">{greeting},</p>
          <h1 className="font-display font-extrabold text-6xl text-gray-900 leading-tight">
            {firstName}.
          </h1>
        </motion.div>

        {/* Day note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-amber-600 text-sm font-medium font-body"
        >
          {daySub}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5 }}
          className="w-16 h-px bg-gray-200"
        />

        {/* Personal note */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 text-lg font-body leading-relaxed italic"
        >
          "{note}"
        </motion.p>

        {/* Enter button */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={handleEnter}
          className="mk-btn text-lg px-12 py-4 mt-2"
        >
          Enter Mikkal
        </motion.button>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-2 text-gray-400 text-xs font-body"
        >
          <div className="w-5 h-5 rounded bg-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xs">M</span>
          </div>
          Mikkal — Private Access
        </motion.div>
      </div>
    </motion.main>
  )
}
