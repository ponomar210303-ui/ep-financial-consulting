import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToolCards from '@/components/ToolCards';
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
        <div className="mt-10">
          <ToolCards locale={locale} openLabel={t.tools.open} />
        </div>
      </main>
      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
