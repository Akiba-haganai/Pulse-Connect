import PWAInstallPrompt from '../components/PWAInstallPrompt';
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register service workers within production browser spaces
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('🛰️ Pulse Service Worker armed successfully:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failure:', error);
          });
      });
    }
  }, []);

  return null; // This component runs entirely as an invisible registration lifecycle manager
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-black">
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Mounts unobtrusively above bottom tab navigation bars */}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}

export const metadata = {
  title: 'Pulse Connect',
  description: 'CBU Student Platform',
  // 🍏 iOS PWA Native Overrides
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pulse Connect',
  },
  formatDetection: {
    telephone: false, // Prevents Safari from auto-linking and messing up phone styling
  },
};