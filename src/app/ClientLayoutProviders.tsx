'use client';

import { useEffect } from 'react';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export function ServiceWorkerRegister() {
  useEffect(() => {
    // Check for window to confirm browser layer context execution safely
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD ) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('🛰️ Pulse Service Worker armed successfully:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failure:', error);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
        return () => window.removeEventListener('load', registerSW);
      }
    }
  }, []);

  return null;
}

export default function ClientLayoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <main className="min-h-screen">
        {children}
      </main>
      {/* Mounts unobtrusively above bottom tab navigation bars */}
      <PWAInstallPrompt />
    </>
  );
}