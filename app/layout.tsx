import type { Metadata } from 'next'
import { Orbitron, Bungee_Hairline, Inter } from 'next/font/google'
import Providers from './providers'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '900'],
})

const bungeeHairline = Bungee_Hairline({
  subsets: ['latin'],
  variable: '--font-bungee',
  weight: ['400'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Mikkal — Your Personal AI',
  description: 'Wisdom. Insight. Intelligence.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${bungeeHairline.variable} ${inter.variable}`}>
      <body className="bg-white text-gray-900 antialiased" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#111827',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontFamily: 'var(--font-inter)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
