import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Bricolage_Grotesque, Cormorant_Garamond, Space_Mono } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '700'],
});

const inkFree = localFont({
  src: '../public/brand/inkfree.ttf',
  variable: '--font-ink',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Keep Playing',
    template: '%s — Keep Playing',
  },
  description: 'The operating environment for AhTohMoh.',
  applicationName: 'Keep Playing',
  authors: [{ name: 'AhTohMoh (WYETEY LTD)' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#060709',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${cormorant.variable} ${inkFree.variable} ${spaceMono.variable}`}
    >
      <body className="bg-bg text-ink">{children}</body>
    </html>
  );
}
