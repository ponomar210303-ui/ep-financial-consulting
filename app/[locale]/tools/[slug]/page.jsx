import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import tools, { toolText } from '@/config/tools';
import { getDictionary } from '@/i18n/dictionaries';
import { locales, alternatesFor, ogLocales } from '@/i18n/config';
import { BASE_URL, SITE_NAME } from '@/lib/site';
import ToolLoader from './ToolLoader';

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => tools.map((tool) => ({ locale, slug: tool.slug })));
}

export function generateMetadata({ params }) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) return {};
  const { title, desc } = toolText(tool, params.locale);
  const path = `/tools/${tool.slug}`;
  return {
    title,
    description: desc,
    alternates: alternatesFor(params.locale, path),
    openGraph: {
      title,
      description: desc,
      url: `/${params.locale}${path}`,
      type: 'website',
      locale: ogLocales[params.locale],
      siteName: SITE_NAME,
    },
  };
}

export default function ToolPage({ params }) {
  const { locale } = params;
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) notFound();
  const t = getDictionary(locale);
  const { title, desc } = toolText(tool, locale);

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t.nav.home, item: `${BASE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: t.tools.title, item: `${BASE_URL}/${locale}/tools` },
      { '@type': 'ListItem', position: 3, name: title, item: `${BASE_URL}/${locale}/tools/${tool.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <Navbar locale={locale} t={t.nav} languages={t.languages} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs
          label={t.tools.breadcrumb}
          items={[
            { name: t.nav.home, href: `/${locale}` },
            { name: t.tools.title, href: `/${locale}/tools` },
            { name: title },
          ]}
        />
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-[1.75rem] leading-none" aria-hidden="true">
            {tool.emoji}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{desc}</p>
          </div>
        </div>
        <div className="mt-8">
          <ToolLoader slug={tool.slug} locale={locale} loadingText={t.tools.loading} />
        </div>
      </main>
      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
