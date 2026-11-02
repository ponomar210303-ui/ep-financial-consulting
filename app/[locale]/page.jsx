import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Portrait from '@/components/Portrait';
import ProjectVideo from '@/components/ProjectVideo';
import tools, { toolText } from '@/config/tools';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesFor, ogLocales } from '@/i18n/config';
import {
  BASE_URL,
  SITE_NAME,
  CONTACT,
  AGROSTIT_VIDEO_ID,
  CHERRYPICKER_APP_STORE,
} from '@/lib/site';

export function generateMetadata({ params }) {
  const t = getDictionary(params.locale);
  return {
    title: { absolute: t.meta.title },
    description: t.meta.description,
    alternates: alternatesFor(params.locale),
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      url: `/${params.locale}`,
      type: 'profile',
      locale: ogLocales[params.locale],
      siteName: SITE_NAME,
    },
  };
}

function Points({ items }) {
  return (
    <ul className="mt-6 space-y-3 text-[0.95rem] leading-relaxed text-foreground/85">
      {items.map((item) => (
        <li key={item.slice(0, 24)} className="relative pl-5">
          <span className="absolute left-0 top-[0.7em] h-px w-2.5 bg-muted-foreground/60" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProjectHeader({ name, tagline, status }) {
  return (
    <>
      <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h3>
      <p className="mt-3 text-lg leading-relaxed text-foreground/85">{tagline}</p>
      {status && <p className="mt-3 text-sm text-muted-foreground">{status}</p>}
    </>
  );
}

export default function HomePage({ params }) {
  const { locale } = params;
  const t = getDictionary(locale);
  const p = t.projects;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    url: `${BASE_URL}/${locale}`,
    jobTitle: 'Business Controller',
    worksFor: { '@type': 'Organization', name: 'Timac Agro Slovakia s.r.o.' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bratislava', addressCountry: 'SK' },
    email: `mailto:${CONTACT.email}`,
    sameAs: [CONTACT.linkedin],
    knowsLanguage: ['sk', 'en', 'ru'],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar locale={locale} t={t.nav} languages={t.languages} />

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm text-muted-foreground">{t.hero.role}</p>
              <h1 className="mt-3 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                {SITE_NAME}
              </h1>
              <p className="mt-6 max-w-2xl font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                {t.hero.headline}
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">{t.hero.lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/${locale}#projects`}
                  className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.hero.primaryCta}
                </Link>
                <Link
                  href={`/${locale}#contact`}
                  className="inline-flex h-11 items-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {t.hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="w-full max-w-[180px] sm:max-w-[240px] lg:max-w-none">
              <Portrait alt={t.hero.photoAlt} placeholder={t.hero.photoPlaceholder} />
            </div>
          </div>

          <dl className="mt-14 grid border-t border-border sm:mt-20 sm:grid-cols-3">
            {t.hero.facts.map((fact) => (
              <div
                key={fact.label}
                className="flex flex-col-reverse gap-2 border-b border-border py-6 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
              >
                <dt className="max-w-[28ch] text-sm leading-snug text-muted-foreground">{fact.label}</dt>
                <dd className="font-mono text-4xl font-medium tracking-tight tabular-nums">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-8 sm:mt-12">
          <About t={t.about} />
        </div>

        {/* Projects */}
        <section id="projects" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{p.title}</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{p.intro}</p>

            <article className="mt-12 grid gap-10 border-t border-border pt-12 lg:grid-cols-2 lg:gap-14">
              <div>
                <ProjectHeader {...p.agrostit} />
                <Points items={p.agrostit.points} />
              </div>
              <div className="lg:pt-1">
                <ProjectVideo
                  id={AGROSTIT_VIDEO_ID}
                  title={p.agrostit.videoTitle}
                  playLabel={p.agrostit.videoPlay}
                  caption={p.agrostit.videoLabel}
                />
              </div>
            </article>

            <article className="mt-16 grid gap-10 border-t border-border pt-12 lg:grid-cols-2 lg:gap-14">
              <div className="lg:order-2">
                <ProjectHeader {...p.cherrypicker} />
                <Points items={p.cherrypicker.points} />
              </div>
              <div className="lg:order-1 lg:pt-1">
                <dl className="divide-y divide-border rounded-xl border border-border bg-muted">
                  {p.cherrypicker.stats.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-6 px-6 py-5">
                      <dt className="text-sm text-muted-foreground">{s.label}</dt>
                      <dd className="font-mono text-3xl font-medium tabular-nums">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href={CHERRYPICKER_APP_STORE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {p.cherrypicker.storeLink}
                </a>
              </div>
            </article>

            <article className="mt-16 border-t border-border pt-12">
              <div className="max-w-3xl">
                <ProjectHeader name={p.automation.name} tagline={p.automation.tagline} />
              </div>
              <div className="mt-8 overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-medium">{p.automation.columns.process}</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">{p.automation.columns.before}</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">{p.automation.columns.after}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {p.automation.rows.map((row) => (
                      <tr key={row.process}>
                        <th scope="row" className="px-5 py-4 font-normal leading-snug">{row.process}</th>
                        <td className="whitespace-nowrap px-5 py-4 text-right tabular-nums text-muted-foreground">{row.before}</td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold tabular-nums text-primary">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{p.automation.stack}</p>
            </article>
          </div>
        </section>

        {/* Calculators */}
        <section id="tools" className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.tools.title}</h2>
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
          </div>
        </section>

        <Contact locale={locale} t={t.contact} />
      </main>

      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
