/**
 * Web App Manifest — позволяет установить сайт как PWA
 * (Chrome/Edge на Android и десктопе → «Установить приложение»).
 * Next.js автоматически отдаёт это по пути /manifest.webmanifest.
 */
export default function manifest() {
  return {
    name: 'EP. Финансовый консалтинг',
    short_name: 'EP.',
    description:
      'Живность, учёт и налоги для русскоязычных предпринимателей в Словакии.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'ru',
    background_color: '#09090f',
    theme_color: '#09090f',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
