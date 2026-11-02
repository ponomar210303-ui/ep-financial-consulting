import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import '@/index.css';
import { locales, isLocale, alternatesFor, ogLocales } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { BASE_URL, SITE_NAME } from '@/lib/site';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }) {
  const t = getDictionary(params.locale);
  return {
    metadataBase: new URL(BASE_URL),
    title: { default: t.meta.title, template: `%s | ${SITE_NAME}` },
    description: t.meta.description,
    alternates: alternatesFor(params.locale),
    openGraph: {
      siteName: SITE_NAME,
      locale: ogLocales[params.locale],
      type: 'website',
    },
    twitter: { card: 'summary_large_image' },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
  };
}

export const viewport = {
  themeColor: '#ffffff',
};

export default function LocaleLayout({ children, params }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDictionary(params.locale);

  return (
    <html
      lang={params.locale}
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:font-medium"
        >
          {t.skipLink}
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
