export default function manifest(): Record<string, any> {
  return {
    name: 'Pulse Connect CBU',
    short_name: 'Pulse',
    description: 'The student-focused social, marketplace, and study hub for Copperbelt University.',
    start_url: '/',
    display: 'standalone', // Hides browser address bars for a native app feel
    background_color: '#000000', // Pure True Black background for smooth launching
    theme_color: '#4f46e5', // Indigo-600 accent to match your UI framing
    orientation: 'portrait-only', // Keeps the UI locked defensively on mobile devices
    categories: ['education', 'social', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // Required for Android to clip your icon into shapes cleanly
      },
    ],
  };
}