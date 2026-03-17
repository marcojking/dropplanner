import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from '@/components/navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'DropPlanner — Indie Music Release Planner',
  description: 'AI-powered release timeline for indie musicians',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
