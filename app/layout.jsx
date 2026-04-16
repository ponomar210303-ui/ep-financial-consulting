import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/index.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

// Sets the `dark` class before React hydrates, preventing the FOUC that the
// audit flagged (`index.html` hardcoded `class="dark"` while Landing.jsx
// stripped it in useEffect). Reads the same `ep-theme` key that the current
// Vite app uses, so the transition is seamless.
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('ep-theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export const metadata = {
  metadataBase: new URL('https://epfinance.sk'),
  title: {
    default: 'EP. — Финансовый консалтинг в Словакии | Евгений Пономарёв',
    template: '%s | EP.',
  },
  description:
    'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
