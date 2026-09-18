import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { profile } from '@/content/profile';
import { copy } from '@/content/copy';
import { Providers } from '@/components/chrome/Providers';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { siteUrl, personSchema } from '@/content/seo';
import './globals.css';
const switzer = localFont({
  src: '../public/fonts/switzer.woff2',
  variable: '--font-switzer',
  display: 'swap',
  weight: '100 900',
});
const mono = localFont({
  src: '../public/fonts/jetbrains-mono.woff2',
  variable: '--font-jetbrains',
  display: 'swap',
  weight: '400 500',
});
const gambetta = localFont({
  src: '../public/fonts/gambetta.woff2',
  variable: '--font-gambetta',
  display: 'swap',
  weight: '100 900',
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${profile.name} | Signal`, template: `%s | ${profile.name}` },
  description: copy.seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: copy.brand,
    title: profile.name,
    description: copy.seo.description,
  },
  icons: { icon: '/icon.svg' },
  twitter: { card: 'summary_large_image' },
};
export const viewport: Viewport = { colorScheme: 'dark', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${switzer.variable} ${mono.variable} ${gambetta.variable}`}>
        <a className="skip-link" href="#main" tabIndex={0}>
          {copy.skip}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personSchema).replace(/</g, '\\u003c'),
          }}
        />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
