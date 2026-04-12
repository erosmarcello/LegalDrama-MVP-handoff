import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Source_Serif_4, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const bricolage = Bricolage_Grotesque({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LegalDrama.ai - Turn Court Cases Into Legal Dramas',
  description: 'Transform federal court cases into compelling legal narratives. Search PACER, generate screenplays, and create dramatic retellings of real cases.',
  keywords: ['legal', 'court cases', 'PACER', 'screenplay', 'drama', 'legal tech', 'AI'],
  authors: [{ name: 'LegalDrama.ai' }],
  creator: 'LegalDrama.ai',
  openGraph: {
    title: 'LegalDrama.ai - Turn Court Cases Into Legal Dramas',
    description: 'Transform federal court cases into compelling legal narratives.',
    type: 'website',
    locale: 'en_US',
    siteName: 'LegalDrama.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegalDrama.ai',
    description: 'Turn Real Court Cases Into Thrilling Legal Dramas',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF9EC' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1810' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
