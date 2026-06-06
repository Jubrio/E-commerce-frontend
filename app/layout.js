import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/providers/ThemeProvider';
import AuthProvider  from '@/components/providers/AuthProvider';
import InstallBanner from '@/components/InstallBanner';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata = {
  title:       'Bazar Guyane — Marketplace',
  description: 'La marketplace de la Guyane',
  manifest:    '/manifest.json',
  icons: {
    icon:     '/Logo.png',
    shortcut: '/Logo.png',
    apple:    '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'default',
    title:           'Bazar Guyane',
  },
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="application-name"                content="Bazar Guyane" />
        <meta name="apple-mobile-web-app-capable"    content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"      content="Bazar Guyane" />
        <meta name="mobile-web-app-capable"          content="yes" />
        <meta name="theme-color"                     content="#ffffff" />
        <link rel="manifest"                         href="/manifest.json" />
        <link rel="apple-touch-icon"                 href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          <AuthProvider>
            <InstallBanner />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}