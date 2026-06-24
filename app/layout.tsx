import type { Metadata } from 'next'
import './globals.css'
import { TodoProvider } from '../store/TodoProvider'

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
      <body>
        <TodoProvider>{children}</TodoProvider>
      </body>
    </html>
  )
}
