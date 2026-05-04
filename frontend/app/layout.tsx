import type { Metadata } from 'next'
import Nav from '@/components/layout/Nav'

export const metadata: Metadata = {
  title: 'Glow Cycle',
  description: 'Your intelligent skincare companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main style={{ paddingBottom: '80px' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
