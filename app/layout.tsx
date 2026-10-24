import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Kanit } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { assetPath, LOCAL_MODE } from '@/lib/deployment'

const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-kanit',
})

const shareTechMono = localFont({
  src: '../public/fonts/retro/share-tech-mono-latin.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-share-tech-mono',
  adjustFontFallback: false,
})

const headingFont = localFont({
  src: '../public/fonts/retro/press-start-2p-latin.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-heading',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: 'Database City — เกมนักสืบฐานข้อมูล',
  description: 'เรียนรู้ฐานข้อมูลผ่านภารกิจนักสืบ 16 หน่วย 18 สัปดาห์ ด้วย MySQL Workbench',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: assetPath('/icon-light-32x32.png'),
        media: '(prefers-color-scheme: light)',
      },
      {
        url: assetPath('/icon-dark-32x32.png'),
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: assetPath('/icon.svg'),
        type: 'image/svg+xml',
      },
    ],
    apple: assetPath('/apple-icon.png'),
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${kanit.variable} ${shareTechMono.variable} ${headingFont.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && !LOCAL_MODE && <Analytics />}
      </body>
    </html>
  )
}
