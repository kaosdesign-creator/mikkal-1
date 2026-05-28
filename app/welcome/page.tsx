'use client'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Custom notes Brent has written for each family member
// Key = Clerk user ID or email, value = personal note
const PERSONAL_NOTES: Record<string, string> = {
  // Add your family members here like:
  // 'user_abc123': "You're one of the first people I trusted with this. Enjoy every bit of it.",
  // 'brent@example.com': "Welcome home.",
  'default': "You're here because you matter. Make yourself at home."
}

function getTimeOfDay(): { greeting: string; sub: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)  return { greeting: 'Good morning',   sub: "Let's start something great today." }
  if (h >= 12 && h < 17) return { greeting: 'Good afternoon', sub: "What can we build together?" }
  if (h >= 17 && h < 21) return { greeting: 'Good evening',   sub: "Mikkal's ready when you are." }
  return { greeting: 'Hey, night owl',  sub: "Mikkal never sleeps either." }
}

function getDayGreeting(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const day = days[new Date().getDay()]
  if (day === 'Friday')   return "Happy Friday — the weekend's almost here."
  if (day === 'Saturday' || day === 'Sunday') return `Enjoy your ${day}.`
  return ''
}

export default function WelcomePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [entering, setEntering] = useState(false)

  useEffect(() => {
    if (isLoaded) setTimeout(() => setShow(true), 100)
  }, [isLoaded])

  const { greeting, sub } = getTimeOfDay()
  const dayNote = getDayGreeting()
  const firstName = user?.firstName || user?.username || 'Friend'

  const personalNote =
    PERSONAL_NOTES[user?.id || ''] ||
    PERSONAL_NOTES[user?.primaryEmailAddress?.emailAddress || ''] ||
    PERSONAL_NOTES['default']

  const handleEnter = () => {
    setEntering(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  if (!isLoaded) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: entering ? 0 : 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-brand-navy flex flex-col items-center justify-center relative overflow-hidden px-6"
        >
          {/* Warm glow for welcome */}
          <div className="absolute inset-0 bg-mikkal-warm pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-amber opacity-[0.04] blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl w-full flex flex-col items-center text-center gap-6">

            {/* User avatar */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6, type: 'spring' }}
              className="w-20 h-20 rounded-full border-2 border-brand-amber overflow-hidden bg-brand-charcoal flex items-center justify-center glow-amber"
            >
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={firstName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-800 text-3xl text-brand-amber">
                  {firstName[0]?.toUpperCase()}
                </span>
              )}
            </motion.div>

            {/* Time greeting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-col gap-1"
            >
              <p className="text-brand-muted text-lg font-body">{greeting},</p>
              <h1 className="font-display font-800 text-6xl text-brand-white leading-none">
                {firstName}.
              </h1>
            </motion.div>

            {/* Day note */}
            {dayNote && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-brand-amber text-sm font-body"
              >
                {dayNote}
              </motion.p>
            )}

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="w-24 h-px bg-brand-border"
            />

            {/* Personal note from Brent */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="text-brand-white text-lg font-body leading-relaxed italic"
            >
              "{personalNote}"
            </motion.p>

            {/* Sub greeting */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-brand-muted text-sm"
            >
              {sub}
            </motion.p>

            {/* Enter button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              onClick={handleEnter}
              className="mt-4 mikkal-btn-primary text-lg px-12 py-4 glow-cyan"
            >
              Enter Mikkal
            </motion.button>

            {/* Mikkal brand */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-2 mt-4"
            >
              <div className="w-6 h-6 rounded-md bg-brand-charcoal border border-brand-border flex items-center justify-center">
                <span className="font-display font-800 text-xs text-brand-cyan">M</span>
              </div>
              <span className="text-brand-muted text-xs font-body">Mikkal — Private Access</span>
            </motion.div>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  )
}
