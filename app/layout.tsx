import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cadence',
  description: 'A precise, keyboard-first todo app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
