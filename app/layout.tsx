import type { Metadata } from 'next'
import { Orbitron, Bungee_Hairline, Plus_Jakarta_Sans } from 'next/font/google'
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

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Mikkal — Your Personal AI',
  description: 'Wisdom. Insight. Intelligence.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${bungeeHairline.variable} ${plusJakarta.variable}`}>
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