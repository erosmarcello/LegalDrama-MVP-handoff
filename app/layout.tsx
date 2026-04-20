import type { Metadata, Viewport } from 'next'
import { Inter, Anton, Source_Serif_4, JetBrains_Mono, EB_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
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

// EB Garamond — the "gold contract" font. Classic legal-document serif
// used for gold metadata taglines, character names, case numbers, and
// anywhere we want a dignified courtroom-dossier feel.
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-garamond',
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
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${anton.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} ${ebGaramond.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={true}
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
