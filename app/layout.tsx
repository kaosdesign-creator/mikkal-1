import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Syne, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Mikkal — Your Personal AI',
  description: 'Everything you need. One place. Mikkal.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${inter.variable}`}>
        <body className="bg-brand-navy text-brand-white font-body antialiased">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1D2E',
                color: '#F0F0F0',
                border: '1px solid #2A2D3E',
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
