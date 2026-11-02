import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesFor } from '@/i18n/config';

export function generateMetadata({ params }) {
  const t = getDictionary(params.locale);
  return { title: t.privacy.title, alternates: alternatesFor(params.locale, '/privacy') };
}

export default function PrivacyPage({ params }) {
  const { locale } = params;
  const t = getDictionary(locale);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar locale={locale} t={t.nav} languages={t.languages} />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-4xl font-semibold tracking-tight">{t.privacy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.privacy.updated}</p>
        <div className="mt-10 space-y-8">
          {t.privacy.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-foreground/85">{s.body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
