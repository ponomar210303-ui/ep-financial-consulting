/**
 * Web App Manifest. Next.js serves it at /manifest.webmanifest.
 */
export default function manifest() {
  return {
    name: 'Evgenii Ponomarev',
    short_name: 'EP.',
    description: 'Business Controller, finance automation and AI agents. Bratislava.',
    start_url: '/sk',
    scope: '/',
    display: 'standalone',
    lang: 'sk',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
