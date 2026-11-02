import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import tools, { toolText } from '@/config/tools';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesFor, ogLocales } from '@/i18n/config';
import { SITE_NAME } from '@/lib/site';

export function generateMetadata({ params }) {
  const t = getDictionary(params.locale);
  return {
    title: t.tools.pageTitle,
    description: t.tools.pageDescription,
    alternates: alternatesFor(params.locale, '/tools'),
    openGraph: {
      title: t.tools.pageTitle,
      description: t.tools.pageDescription,
      url: `/${params.locale}/tools`,
      type: 'website',
      locale: ogLocales[params.locale],
      siteName: SITE_NAME,
    },
  };
}

export default function ToolsIndexPage({ params }) {
  const { locale } = params;
  const t = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar locale={locale} t={t.nav} languages={t.languages} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t.tools.pageTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t.tools.intro}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => {
            const text = toolText(tool, locale);
            const Icon = tool.icon;
            return (
              <li key={tool.slug}>
                <Link
                  href={`/${locale}/tools/${tool.slug}`}
                  className="group flex h-full gap-4 rounded-xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-lg font-semibold">{text.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{text.desc}</span>
                    <span className="mt-3 block text-sm font-medium text-primary group-hover:underline">{t.tools.open}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
