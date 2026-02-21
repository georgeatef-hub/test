import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Bartera - Trade What You Have for What You Need',
  description: 'A multilateral bartering platform that connects people in circular trades',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0f0a] text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}