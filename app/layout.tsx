import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MY ABU Ticket',
  description: 'ABU Transportation Management System',
  generator: 'Next.js',
  applicationName: 'MY ABU Ticket',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
