# Миграция с Vite SPA на Next.js (App Router)

Документ сопровождает переход сайта epfinance.sk с клиентского Vite SPA на Next.js App Router со статической генерацией (SSG). Цель — дать поисковикам и соц-парсерам полный HTML с метаданными, без чего весь SEO-фундамент (OG, JSON-LD, sitemap) фактически не работает для всех, кроме Googlebot.

См. общий аудит: `~/.claude/plans/mighty-toasting-adleman.md` (пункт 1.1).

---

## 0. Закреплённые решения

| Решение | Выбор |
|--|--|
| Роутер | **App Router** (Next.js 15, Server Components, Metadata API) |
| Стратегия | **In-place**, новая ветка `feat/nextjs-migration` в этом репо |
| Base44 SDK | **Выпиливаем полностью** — публичному сайту авторизация не нужна |
| Язык | **JSX** (без TS-миграции в этом шаге — слишком большой объём) |
| Рендеринг | **SSG** — контент статичный, все страницы пре-рендерим на билде |
| Хостинг | **Vercel** (без изменений — автоматически определит Next.js) |

---

## 1. Инвентаризация существующего кода

### 1.1. Base44 touchpoints (удалить)

| Файл | Что делает | Действие |
|--|--|--|
| `src/api/base44Client.js` | Инициализация `createClient` из `@base44/sdk` | Удалить целиком |
| `src/lib/AuthContext.jsx` | `AuthProvider`, `useAuth`, вызовы `/api/apps/public` | Удалить целиком |
| `src/lib/app-params.js` | Чтение `app_id`/`access_token` из URL и localStorage | Удалить целиком |
| `src/components/UserNotRegisteredError.jsx` | Экран ошибки авторизации | Удалить, если нет других импортов |
| `vite.config.js` | Плагин `@base44/vite-plugin` | Удалить вместе с `vite.config.js` целиком на шаге 4 |
| `src/App.jsx` (строки 6-7, 14-35, 54) | Импорт `AuthProvider`, `useAuth`, обёртка рендера | Файл удаляется на шаге 4 |
| `src/lib/PageNotFound.jsx` | Импортирует `useAuth` (видимо для admin-note) | На шаге 4 превращается в `app/not-found.jsx` без auth |

### 1.2. Неиспользуемые тяжёлые зависимости (удалить)

Проверено `grep`-ом по `src/`:

| Пакет | Используется? | Размер (прим.) | Действие |
|--|--|--|--|
| `three` | ❌ Нет | ~600 KB | Удалить |
| `react-leaflet` | ❌ Нет | ~150 KB | Удалить |
| `react-quill` | ❌ Нет | ~200 KB | Удалить |
| `@stripe/react-stripe-js` | ❌ Нет | ~70 KB | Удалить |
| `@stripe/stripe-js` | ❌ Нет | ~20 KB | Удалить |
| `@hello-pangea/dnd` | ❌ Нет | ~100 KB | Удалить |
| `canvas-confetti` | ❌ Нет | ~10 KB | Удалить |
| `moment` | ❌ Нет (есть `date-fns`) | ~70 KB | Удалить |
| `@hookform/resolvers` | ❌ Пока нет (пригодится для валидации формы) | — | Оставить (п. 1.4 аудита) |
| `zod` | ❌ Пока нет (пригодится) | — | Оставить |
| `bysquare`, `qrcode` | ✅ Да (в InvoiceGenerator для SK QR-pay) | — | Оставить |

Ожидаемая экономия бандла: ~1.2 MB pre-gzip.

### 1.3. Клиент-специфичный код (`'use client'` + проверки `typeof window`)

**Файлы с `useState` / `useEffect` / handlers (27 файлов)** — станут Client Components:
- Все tool-компоненты: `TaxCalcSZCO`, `ZivnostComparison`, `InvoiceGenerator`, `PenaltyCalc`, `TaxCalculator`
- Навигация и UI: `Navbar`, `MobileMenu`, `ThemeToggle`, `Footer`, `HeroAnimation`, `AnimatedSection`
- Секции с интерактивом: `Services`, `Contact`, `ToolsSection`
- Все `src/components/ui/*` использующие состояние (accordion, dialog, dropdown, sheet, sidebar, и т.д.)

**Файлы с чистым SSR-unsafe кодом** (обернуть в `typeof window !== 'undefined'` или вынести в `useEffect`):
- `src/lib/utils.js:9` — `export const isIframe = window.self !== window.top;` — падает на SSR, **обязательно поправить**
- `src/hooks/use-mobile.jsx` — `window.innerWidth`, уже внутри `useEffect`, ок
- `src/components/ThemeToggle.jsx` — `localStorage`/`document.documentElement`, уже в `useEffect`, ок
- `src/pages/Landing.jsx:17-22` — `localStorage.getItem('ep-theme')` в `useEffect`, ок (но логику лучше вынести в inline-script в `<head>` чтобы убрать FOUC — пункт 1.5 аудита)

### 1.4. Потребители `import.meta.*`

- `src/lib/app-params.js:43,46,47` — `import.meta.env.VITE_BASE44_*` → уйдёт вместе с Base44
- `src/lib/blog.js:18` — `import.meta.glob('../content/blog/*.md', {...})` → **перевести на `fs.readFile` + `fs.readdir`** (Next.js Server Component).

### 1.5. Потребители `react-router-dom` (9 файлов)

| Файл | Что из RR использует | На что меняем |
|--|--|--|
| `src/App.jsx` | `BrowserRouter`, `Routes`, `Route` | Удаляется, роутинг делает файловая система App Router |
| `src/components/BlogSection.jsx` | `Link` | `import Link from 'next/link'`, `to=` → `href=` |
| `src/components/Navbar.jsx` | `Link`, `useNavigate`, `useLocation` | `next/link` + `useRouter`, `usePathname` из `next/navigation` |
| `src/components/MobileMenu.jsx` | `useNavigate`, `useLocation` | то же |
| `src/pages/Blog.jsx` | `Link` | `next/link` |
| `src/pages/BlogPost.jsx` | `useParams`, `Link` | `params` приходит пропом в page.jsx; `Link` → next/link |
| `src/pages/ToolsIndex.jsx` | `Link` | `next/link` |
| `src/pages/ToolPage.jsx` | `useParams`, `Link`, `Navigate` | `params` проп; `redirect('/tools')` или `notFound()` из `next/navigation` |
| `src/lib/PageNotFound.jsx` | `useLocation` | Превращается в `app/not-found.jsx`, `useLocation` → `usePathname` |

### 1.6. Потребители `react-helmet-async` (2 файла)

- `src/main.jsx` — `<HelmetProvider>` обёртка (файл удаляется на шаге 4, провайдер не нужен)
- `src/components/SEO.jsx` — обёртка над `<Helmet>` с OG/Twitter/JSON-LD → **удаляется целиком**, её роль берёт на себя Next.js Metadata API + inline `<script type="application/ld+json">` в JSX

### 1.7. Статика в `public/`

```
public/
  favicon.svg           ← переезжает как есть
  images/
    about.png           ← переезжает, в п. 2.8 аудита конвертировать в WebP
    blog/*.{jpg,webp}   ← переезжают как есть
  robots.txt            ← УДАЛИТЬ (будет динамический через app/robots.js)
  sitemap.xml           ← УДАЛИТЬ (будет динамический через app/sitemap.js)
```

### 1.8. Используемые shadcn-компоненты (оставляем все 48)

Все файлы в `src/components/ui/*` переезжают как есть. Большинство из них не имеет top-level состояния, т.е. в server-only контекстах будут работать; те что с состоянием — просто требуют `'use client'` на использующем их компоненте (не на них самих, т.к. они не являются entry points).

---

## 2. Целевая структура

```
.
├── app/                              ← НОВОЕ: корень App Router
│   ├── layout.jsx                    ← HTML shell + <html lang="ru"> + шрифт + inline theme-init script
│   ├── page.jsx                      ← лендинг (Server Component с metadata)
│   ├── not-found.jsx                 ← замена PageNotFound.jsx
│   ├── robots.js                     ← динамический robots.txt
│   ├── sitemap.js                    ← динамический sitemap.xml
│   ├── blog/
│   │   ├── page.jsx                  ← /blog (index)
│   │   └── [slug]/
│   │       └── page.jsx              ← /blog/:slug + generateStaticParams + generateMetadata
│   └── tools/
│       ├── page.jsx                  ← /tools (index)
│       └── [slug]/
│           └── page.jsx              ← /tools/:slug + generateStaticParams + generateMetadata
├── src/
│   ├── components/                   ← переезжает как есть (с добавлением 'use client' где надо)
│   ├── config/                       ← tools.js переезжает
│   ├── content/blog/                 ← переезжает
│   ├── lib/
│   │   ├── blog.js                   ← ПЕРЕПИСАТЬ: fs.readdir вместо import.meta.glob
│   │   ├── query-client.js           ← можно удалить (React Query нигде не используется по делу)
│   │   ├── utils.js                  ← убрать isIframe либо обернуть в typeof window
│   │   └── site.js                   ← НОВОЕ: BASE_URL, SITE_NAME, общие константы
│   └── hooks/                        ← переезжает
├── public/                           ← переезжает, минус robots.txt и sitemap.xml
├── next.config.mjs                   ← НОВОЕ
├── jsconfig.json                     ← правим paths (должен остаться @/*)
├── tailwind.config.js                ← правим content: добавить ./app/**
├── postcss.config.js                 ← остаётся
├── package.json                      ← большие правки depend/scripts
└── .eslintrc                         ← убрать vite-плагины, добавить next/core-web-vitals
```

Файлы на удаление:
- `index.html`
- `vite.config.js`
- `vercel.json` (Next.js не требует SPA-rewrites)
- `src/main.jsx`
- `src/App.jsx`
- `src/pages/` (всё содержимое — логика уходит в `app/`)
- `src/api/base44Client.js`
- `src/lib/AuthContext.jsx`
- `src/lib/app-params.js`
- `src/components/SEO.jsx`
- `src/components/UserNotRegisteredError.jsx` (если есть)
- `src/lib/PageNotFound.jsx`
- `public/robots.txt`, `public/sitemap.xml`

---

## 3. План миграции по фазам

### Фаза 0. Подготовка и чистка (безопасна, работает на текущем Vite)

Задачи этой фазы можно мержить даже без остальной миграции — сайт продолжит работать как Vite SPA, но станет легче и чище.

**0.1.** Создать ветку `feat/nextjs-migration`.

**0.2.** Удалить мёртвые зависимости из `package.json`:
```
three, react-leaflet, react-quill,
@stripe/react-stripe-js, @stripe/stripe-js,
@hello-pangea/dnd, canvas-confetti, moment
```
Запустить `npm install`, `npm run build`, проверить что сайт собирается.

**0.3.** Удалить Base44-touchpoints:
- Вырезать импорты `useAuth`/`AuthProvider` из `App.jsx` и `PageNotFound.jsx`
- Упростить `App.jsx` до голого рендера `<Routes>` без `AuthenticatedApp`
- Удалить `src/api/base44Client.js`, `src/lib/AuthContext.jsx`, `src/lib/app-params.js`, `src/components/UserNotRegisteredError.jsx` (если есть)
- Убрать плагин `base44()` из `vite.config.js`
- Удалить `@base44/sdk`, `@base44/vite-plugin` из `package.json`
- Удалить переменные `VITE_BASE44_*` из `.env*` (если были)
- `npm install`, `npm run build`, `npm run dev` — проверить что сайт работает.

**0.4.** Починить `src/lib/utils.js:9`:
```js
export const isIframe = typeof window !== 'undefined' && window.self !== window.top;
```
(нужно для SSR-безопасности на фазе 1, но безвредно и на Vite)

**0.5.** Коммит `chore: remove Base44 SDK and unused heavy deps`.

**Verification после фазы 0:**
- `npm run build` проходит
- `npm run dev` — сайт выглядит идентично
- `node_modules` заметно уменьшился (~1.2 MB меньше в бандле)
- В `package.json` нет упоминаний `base44`, `stripe`, `three`, `leaflet`, `quill`, `moment`, `confetti`, `pangea`

---

### Фаза 1. Установка Next.js поверх (ещё до удаления Vite)

Цель — получить Next.js в том же репо, параллельно с Vite, для поэтапного переноса.

**1.1.** Установить Next.js и вспомогательное:
```
npm install next@latest gray-matter
npm install -D eslint-config-next
```
(`gray-matter` заменит наш самописный парсер frontmatter в `blog.js`.)

**1.2.** Создать `next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // оставим дефолт — Next сам оптимизирует
  },
};
export default nextConfig;
```

**1.3.** Обновить `jsconfig.json` paths (Next.js совместим с alias `@/*` → `./src/*`, но добавим корневой alias для `app/`):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.js", "**/*.jsx", "app/**/*"]
}
```

**1.4.** Обновить `tailwind.config.js` — добавить `./app/**/*.{js,jsx}` в `content`.

**1.5.** Добавить временные скрипты в `package.json`:
```json
"scripts": {
  "dev:vite": "vite",
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

**1.6.** Скелет `app/layout.jsx` — только `<html>`, `<body>`, подключение `globals.css`, inline theme-init script, шрифт через `next/font`:

```jsx
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/index.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300','400','500','600','700','800','900'],
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-mono',
  display: 'swap',
});

// Inline скрипт в <head> — ставит class="dark" ДО гидратации, если в localStorage сохранена тёмная тема
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('ep-theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**1.7.** Временно перенести `src/index.css` → оставить на месте, но убрать из него `@import url('https://fonts.googleapis.com/css2?...')` — шрифт теперь через `next/font`.

**1.8.** Verification фазы 1:
- `npm run dev` стартует Next.js без ошибок (пока с пустым layout)
- `npm run dev:vite` продолжает работать как раньше

---

### Фаза 2. Перенос страниц в App Router

Страницы переносим по одной. Начинаем с самой простой (`/tools` index), заканчиваем самой сложной (`/` лендинг с 10 секциями).

**Порядок:** `tools/page.jsx` → `tools/[slug]/page.jsx` → `blog/page.jsx` → `blog/[slug]/page.jsx` → `page.jsx` (лендинг) → `not-found.jsx`.

**Общий паттерн page.jsx (Server Component):**

```jsx
import { Metadata } from 'next'; // для IDE-подсказок, в JS не нужен
import SomeClientComponent from '@/components/SomeClientComponent';

export const metadata = {
  title: 'Заголовок — EP.',
  description: '...',
  openGraph: { title, description, images, url, type, locale: 'ru_RU' },
  twitter: { card: 'summary_large_image', ... },
  alternates: { canonical: 'https://epfinance.sk/path' },
};

export default function Page() {
  const jsonLd = { '@context': 'https://schema.org', ... };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />   {/* 'use client' внутри */}
      <Hero />     {/* может быть Server, если без handlers */}
      {/* ... */}
      <Footer />
    </>
  );
}
```

**Маппинг существующих страниц:**

| Старый файл | Новый файл |
|--|--|
| `src/pages/Landing.jsx` | `app/page.jsx` |
| `src/pages/Blog.jsx` | `app/blog/page.jsx` |
| `src/pages/BlogPost.jsx` | `app/blog/[slug]/page.jsx` + `generateStaticParams` + `generateMetadata` |
| `src/pages/ToolsIndex.jsx` | `app/tools/page.jsx` |
| `src/pages/ToolPage.jsx` | `app/tools/[slug]/page.jsx` + `generateStaticParams` + `generateMetadata` |
| `src/lib/PageNotFound.jsx` | `app/not-found.jsx` |

**Nuance'ы:**

- `ToolPage` импортирует сразу все 4 tool-компонента через `componentMap`. В App Router каждый тул — отдельный маршрут, но нужен один `[slug]/page.jsx`. Варианта два:
  - (A) Оставить `componentMap` + `'use client'` на странице — проще, но весь JS 4 калькуляторов грузится на любой тул. Сейчас примерно так и работает.
  - (B) Использовать `next/dynamic` с `ssr: false` и lazy-импортами — каждый тул грузит только свой JS. **Рекомендую (B)** — в сумме это ~120 KB экономии.
- `<Navigate to="/tools" replace />` в `ToolPage.jsx:23` → `import { redirect } from 'next/navigation'; if (!tool) redirect('/tools');` в server-части, ИЛИ `notFound()` если хотим 404.

**`generateStaticParams` для блога и инструментов:**
```jsx
// app/blog/[slug]/page.jsx
import { getAllPosts, getPostBySlug } from '@/lib/blog';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — EP.`,
    description: post.excerpt,
    openGraph: { ... },
    alternates: { canonical: `https://epfinance.sk/blog/${post.slug}` },
  };
}
```

**Navbar и MobileMenu — спец-случай:**
Они используют логику скролла к якорям на лендинге + переход на другие страницы. Новая логика:
```jsx
'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// scrollTo:
const go = (href, external) => {
  if (external) { router.push(href); return; }
  // href типа '#about'
  if (pathname !== '/') {
    router.push('/' + href);  // Next.js сохранит hash
  } else {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }
};
```

---

### Фаза 3. Блог-лоадер на Node fs

Переписать `src/lib/blog.js`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export async function getAllPosts() {
  const files = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf-8');
        const { data, content } = matter(raw);
        const fileSlug = file.replace(/\.md$/, '');
        return {
          slug: data.slug || fileSlug,
          title: data.title || '',
          date: data.date || '',
          updated: data.updated || data.date || '',   // ← п. 2.9 аудита
          category: data.category || '',
          excerpt: data.excerpt || '',
          image: data.image || '',
          readingTime: data.readingTime || data.reading_time || 5,
          content,
        };
      })
  );
  return posts
    .filter((p) => p.title)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

export async function getPostBySlug(slug) {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) || null;
}
```

Все вызовы становятся `async/await`. Изменить потребителей: `app/blog/page.jsx`, `app/blog/[slug]/page.jsx`, `BlogSection` (но `BlogSection` сейчас — Client Component, ему проще принять `posts` пропом из родителя-Server Component).

---

### Фаза 4. Удаление Vite-инфры

Когда все страницы перенесены и `next dev` рендерит всё как надо:

- Удалить `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, `src/pages/`
- Удалить `vercel.json`
- Удалить `src/components/SEO.jsx`, `src/lib/PageNotFound.jsx`
- Удалить зависимости: `vite`, `@vitejs/plugin-react`, `react-router-dom`, `react-helmet-async`, `baseline-browser-mapping`
- Убрать `dev:vite` из scripts
- Почистить ESLint-конфиг от `eslint-plugin-react-refresh`
- Коммит `chore: remove Vite infra, full Next.js migration`

---

### Фаза 5. Динамические robots.txt и sitemap.xml

**`app/robots.js`:**
```js
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://epfinance.sk/sitemap.xml',
  };
}
```

**`app/sitemap.js`:**
```js
import { getAllPosts } from '@/lib/blog';
import tools from '@/config/tools';

const BASE = 'https://epfinance.sk';

export default async function sitemap() {
  const posts = await getAllPosts();
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...tools.map((t) => ({
      url: `${BASE}/tools/${t.slug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.updated || p.date,
      changeFrequency: 'monthly',
      priority: 0.6,
    })),
  ];
}
```

Закрывает пункт 1.3 аудита.

---

### Фаза 6. Верификация и деплой

**Локально:**
1. `rm -rf .next node_modules && npm install && npm run build`
2. `npm run start` — открыть http://localhost:3000, проверить каждую страницу вручную.
3. `curl -s http://localhost:3000/ | grep -o '<title>.*</title>'` — должен отдать реальный заголовок.
4. `curl -s http://localhost:3000/blog/otkrytie-zivnosti-pod-klyuch-slovakia | grep 'og:image'` — должен показать og:image в HTML (не в JS).
5. `npx next build` в логе должен показать все пререндеренные маршруты: `/`, `/blog`, `/blog/*` (6), `/tools`, `/tools/*` (4), `/sitemap.xml`, `/robots.txt`, `/not-found`.

**Прод (Vercel):**
1. Запушить ветку, создать Preview.
2. Проверить Preview URL через:
   - https://search.google.com/test/rich-results — JSON-LD для `/` и любого `/blog/*`
   - https://www.opengraph.xyz/ — OG-превью
   - https://pagespeed.web.dev/ — Core Web Vitals
3. Если всё ок — смёржить в `main`, Vercel выкатит прод.
4. В Google Search Console отправить обновлённый sitemap; в течение нескольких дней проверить Coverage.

**Чеклист «миграция прошла»:**
- [ ] `curl epfinance.sk/` отдаёт `<title>`, `<meta description>`, `og:*` прямо в HTML
- [ ] `curl epfinance.sk/blog/<slug>` отдаёт нужный JSON-LD
- [ ] `/sitemap.xml` доступен и содержит все 11 URL
- [ ] `/robots.txt` доступен
- [ ] Все 4 калькулятора работают (особенно InvoiceGenerator — там PDF/canvas + bysquare QR)
- [ ] Контактная форма отправляется (Web3Forms)
- [ ] Светлая тема без FOUC (устранение п. 1.5 аудита — достигается inline script в layout)
- [ ] Темп-preview в Telegram/WhatsApp/LinkedIn показывает OG-картинку

---

## 4. Риски и подводные камни

| Риск | Митигация |
|--|--|
| `window.self !== window.top` в `utils.js:9` падает на SSR | Починить на фазе 0.4 |
| `react-markdown` + `remark-gfm` — могут тянуть разные версии при SSR | Собрать на фазе 1.8 и проверить, при проблемах — перейти на `@next/mdx` или встроенную MDX компиляцию |
| `framer-motion` требует `'use client'` везде где используется | Добавлять директиву по месту — не проблема |
| `recharts` (в TaxCalcSZCO) — работает только в браузере | `'use client'` в компоненте + всё ок |
| `html2canvas` + `jspdf` в InvoiceGenerator — чистый браузер | `'use client'`, при необходимости — `next/dynamic` с `ssr: false` |
| `bysquare` использует Node-only `crypto`/`zlib` в браузере | Уже работает на Vite, значит полифиллы в порядке. В Next.js может потребоваться `next.config.mjs` webpack config или `ssr: false`. Проверить. |
| Отсутствие `React Query` — но он в `App.jsx` был | Используется единственно для обёртки `QueryClientProvider`, реально `useQuery` не вызывается. Можно выкидывать (проверить `grep useQuery` — должно быть 0). |
| Google Calendar iframe / WhatsApp ссылки | Это просто `<a href>`, без проблем |
| `image` в frontmatter блога ведёт на `/images/blog/*.webp` | Работает одинаково в Next.js, `/public/` отдаётся с корня |
| Smooth-scroll к `#anchor` при переходе с другой страницы | В App Router `router.push('/#about')` сам прокрутит. Проверить; если нет — fallback с `useEffect` + `setTimeout` |

---

## 5. Что НЕ делаем в этой миграции

Эти пункты из аудита — отдельные задачи после миграции:

- ❌ Сборка GA4 / Яндекс.Метрика (п. 1.2 аудита) — делаем следующим шагом, когда Next.js уже на месте и есть куда класть `<Script>`.
- ❌ Валидация формы Contact через zod (п. 1.4) — отдельный PR.
- ❌ Privacy policy, GDPR-чекбокс (п. 2.3) — отдельный PR.
- ❌ Honeypot / hCaptcha в форме (п. 2.4) — отдельный PR.
- ❌ Секция отзывов, цены, FAQ (п. 2.1, 2.2, 2.7) — контентные задачи.
- ❌ Оптимизация `about.png` (п. 2.8) — отдельная мелкая задача.

Цель миграции — **инфраструктура для всего вышеперечисленного**. Как только HTML отдаётся в пре-рендеренном виде с полной метой, все эти задачи становятся имеющими смысл.

---

## 6. Оценка объёма

| Фаза | Объём правок | Риск |
|--|--|--|
| 0. Чистка | ~6 файлов, удаление | Низкий |
| 1. Установка Next.js | ~5 новых файлов | Низкий |
| 2. Перенос страниц | ~15 файлов | Средний (роутер, metadata) |
| 3. Блог-лоадер | 1 файл + потребители | Низкий |
| 4. Удаление Vite | Удаление ~10 файлов | Низкий |
| 5. Sitemap/robots | 2 новых файла | Низкий |
| 6. Верификация | — | — |

**Итого:** ~35-40 файлов затронуто, из них ~15 реально переписывается.
Оценка календарного времени: 1-2 рабочих дня при сосредоточенной работе.

---

## 7. Следующий шаг (прямо сейчас)

Фаза 0: безопасная чистка. Можно делать сразу, в том числе отдельным PR — не привязана к Next.js:

1. Удалить Base44 из `vite.config.js`, `App.jsx`, `package.json`
2. Удалить мёртвые зависимости (three, leaflet, quill, stripe, и т.д.)
3. Починить `isIframe` в `utils.js`
4. Проверить `npm run build` + `npm run dev`
5. Коммит
