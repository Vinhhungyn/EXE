import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Relax&Chill — Tâm sự ẩn danh 24/7',
  description: 'Nền tảng tâm sự ẩn danh kết hợp AI hỗ trợ cảm xúc cho Gen Z Việt Nam',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body>{children}</body>
    </html>
  )
}