import Link from 'next/link';
import Image from 'next/image';
import { Workflow, Bot, LineChart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import About from '@/components/About';
import Contact from '@/components/Contact';
import ProjectVideo from '@/components/ProjectVideo';
import PhoneFrame from '@/components/PhoneFrame';
import AutomationChart from '@/components/AutomationChart';
import Reveal from '@/components/motion/Reveal';
import CountUp from '@/components/motion/CountUp';
import Marquee from '@/components/motion/Marquee';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import FlagText from '@/components/FlagText';
import ToolCards from '@/components/ToolCards';
import { getDictionary } from '@/i18n/dictionaries';
import { alternatesFor, ogLocales } from '@/i18n/config';
import {
  BASE_URL,
  SITE_NAME,
  CONTACT,
  PROFILE_PHOTO,
  AGROSTIT_VIDEO_ID,
  AGROSTIT_SITE,
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

// Spreadsheet-like grid behind the portrait: a nod to where the work starts.
const GRID_STYLE = {
  backgroundImage:
    'linear-gradient(to right, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.09) 1px, transparent 1px)',
  backgroundSize: '44px 32px',
};

const CHIP_ICONS = [Workflow, Bot, LineChart];
const CHIP_POSITIONS = [
  'left-0 top-[54%] sm:-left-4',
  'right-0 top-[68%] sm:-right-4',
  'bottom-5 left-[8%]',
];

const AGROSTIT_SHOTS = ['/images/projects/agrostit-home.webp', '/images/projects/agrostit-result.webp'];
const CHERRYPICKER_SHOTS = ['/images/projects/cherrypicker-plan.webp', '/images/projects/cherrypicker-list.webp'];

function Points({ items, className = '' }) {
  return (
    <ul className={`text-[0.95rem] leading-relaxed ${className}`}>
      {items.map((item) => (
        <li key={item.slice(0, 24)} className="relative pl-5">
          <span className="absolute left-0 top-[0.7em] h-px w-2.5 bg-current opacity-50" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function ProjectStats({ stats }) {
  return (
    <dl className="mt-8 grid max-w-xl gap-3 border-y border-white/15 py-6 sm:grid-cols-3 sm:gap-4">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-row-reverse items-baseline justify-end gap-4 sm:flex-col-reverse sm:items-start sm:gap-1">
          <dt className="text-xs leading-snug text-white/65 sm:text-sm">{s.label}</dt>
          <dd className="w-28 shrink-0 font-mono text-2xl font-medium tabular-nums sm:w-auto sm:text-3xl">
            <CountUp value={s.value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Two phones side by side, the second one set a little lower.
function Shots({ srcs, alts, ratio, island = false }) {
  return (
    <div className="mx-auto grid w-full max-w-[420px] grid-cols-2 items-start gap-6 sm:gap-8 lg:mx-0 lg:w-[440px] lg:max-w-none lg:self-start">
      {srcs.map((src, i) => (
        <PhoneFrame key={src} src={src} alt={alts[i]} ratio={ratio} island={island} className={i === 1 ? 'mt-10' : ''} />
      ))}
    </div>
  );
}

export default function HomePage({ params }) {
  const { locale } = params;
  const t = getDictionary(locale);
  const p = t.projects;
  const [firstName, ...lastName] = SITE_NAME.split(' ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    url: `${BASE_URL}/${locale}`,
    image: PROFILE_PHOTO ? `${BASE_URL}${PROFILE_PHOTO}` : undefined,
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
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:pt-14">
            <Stagger className="relative z-10 lg:pb-24 lg:pt-8">
              <StaggerItem>
                <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground/80 shadow-sm">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {t.hero.status}
                </span>
              </StaggerItem>
              <StaggerItem>
                <h1 className="mt-7 font-display text-[3.4rem] font-semibold leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:text-[5.75rem]">
                  {firstName}
                  <br />
                  {lastName.join(' ')}
                </h1>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-6 text-sm text-muted-foreground">{t.hero.role}</p>
                <p className="mt-2 max-w-xl font-display text-2xl font-medium leading-snug tracking-tight sm:text-[1.75rem]">
                  {t.hero.headline}
                </p>
              </StaggerItem>
              <StaggerItem>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  <FlagText text={t.hero.lead} />
                </p>
              </StaggerItem>
              <StaggerItem>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}#projects`}
                    className="inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {t.hero.primaryCta}
                  </Link>
                  <Link
                    href={`/${locale}#contact`}
                    className="inline-flex h-12 items-center rounded-full border border-border bg-background px-6 text-sm font-medium transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {t.hero.secondaryCta}
                  </Link>
                </div>
              </StaggerItem>
            </Stagger>

            <Reveal y={40} className="relative h-[440px] sm:h-[540px] lg:h-auto lg:min-h-[600px]">
              <div className="absolute inset-x-0 bottom-0 top-[14%] rounded-t-[2.5rem] bg-primary" style={GRID_STYLE} aria-hidden="true" />
              {PROFILE_PHOTO && (
                <Image
                  src={PROFILE_PHOTO}
                  alt={t.hero.photoAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 90vw"
                  className="object-contain object-bottom"
                />
              )}
              {/* Keyword chips sit over the shoulders and arms, never over the face. */}
              {t.hero.chips.map((chip, i) => {
                const Icon = CHIP_ICONS[i];
                return (
                  <span
                    key={chip}
                    className={`keyword-cloud keyword-cloud-${i + 1} absolute inline-flex items-center gap-2 border border-white/60 bg-white/55 px-5 py-3 text-sm font-medium text-foreground shadow-[0_12px_40px_-12px_rgba(15,23,42,0.45)] backdrop-blur-md sm:px-6 sm:py-3.5 sm:text-[0.95rem] ${CHIP_POSITIONS[i]}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/90 text-white sm:h-8 sm:w-8">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    {chip}
                  </span>
                );
              })}
            </Reveal>
          </div>

          <div className="border-y border-border bg-background">
            <dl className="mx-auto grid max-w-6xl px-4 sm:grid-cols-3 sm:px-6">
              {t.hero.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex flex-row-reverse items-center justify-end gap-5 border-b border-border py-5 last:border-b-0 sm:flex-col-reverse sm:items-start sm:gap-2 sm:border-b-0 sm:border-l sm:px-8 sm:py-7 sm:first:border-l-0 sm:first:pl-0"
                >
                  <dt className="max-w-[28ch] text-sm leading-snug text-muted-foreground">{fact.label}</dt>
                  <dd className="w-28 shrink-0 whitespace-nowrap font-mono text-3xl font-medium tracking-tight tabular-nums sm:w-auto sm:text-5xl">
                    <CountUp value={fact.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <Marquee items={t.hero.stack} label={t.hero.stackLabel} />
        </section>

        <About t={t.about} />

        {/* Projects */}
        <section id="projects" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.title}</h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{p.intro}</p>
            </Reveal>

            <Reveal className="mt-14">
              <article className="group overflow-hidden rounded-[2rem] bg-[#0B2545] text-white">
                <ProjectVideo
                  id={AGROSTIT_VIDEO_ID}
                  title={p.agrostit.videoTitle}
                  playLabel={p.agrostit.videoPlay}
                  caption={p.agrostit.videoLabel}
                  poster="/images/projects/agrostit-scene.webp"
                  posterAlt={p.agrostit.sceneAlt}
                  posterClassName="object-[center_12%]"
                  className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.3/1]"
                />
                <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:p-14">
                  <div>
                    <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{p.agrostit.name}</h3>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{p.agrostit.tagline}</p>
                    <p className="mt-4 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm leading-snug text-white/80">{p.agrostit.status}</p>
                    <ProjectStats stats={p.agrostit.stats} />
                    <div>
                      <a
                        href={AGROSTIT_SITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-[#0B2545] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2545]"
                      >
                        {p.agrostit.siteLink}
                      </a>
                    </div>
                  </div>
                  <Shots srcs={AGROSTIT_SHOTS} alts={p.agrostit.shotsAlt} ratio="600 / 1300" />
                  <Points items={p.agrostit.points} className="grid gap-x-12 gap-y-4 space-y-0 border-t border-white/15 pt-8 text-white/75 md:grid-cols-2 lg:col-span-2" />
                </div>
              </article>
            </Reveal>

            <Reveal className="mt-10">
              <article className="group overflow-hidden rounded-[2rem] bg-[#6D1A33] text-white">
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[2.3/1]">
                  <Image
                    src="/images/projects/cherrypicker-scene.webp"
                    alt={p.cherrypicker.sceneAlt}
                    fill
                    sizes="(min-width: 1024px) 1100px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:p-14">
                  <div>
                    <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{p.cherrypicker.name}</h3>
                    <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">{p.cherrypicker.tagline}</p>
                    <p className="mt-4 inline-block rounded-lg bg-white/10 px-3 py-1.5 text-sm leading-snug text-white/80">{p.cherrypicker.status}</p>
                    <ProjectStats stats={p.cherrypicker.stats} />
                    <a
                      href={CHERRYPICKER_APP_STORE}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-[#6D1A33] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#6D1A33]"
                    >
                      {p.cherrypicker.storeLink}
                    </a>
                  </div>
                  <Shots srcs={CHERRYPICKER_SHOTS} alts={p.cherrypicker.shotsAlt} ratio="600 / 1304" island />
                  <Points items={p.cherrypicker.points} className="grid gap-x-12 gap-y-4 space-y-0 border-t border-white/15 pt-8 text-white/75 md:grid-cols-2 lg:col-span-2" />
                </div>
              </article>
            </Reveal>

            <Reveal className="mt-10">
              <article className="rounded-[2rem] border border-border bg-background p-6 shadow-sm sm:p-10 lg:p-14">
                <div className="max-w-3xl">
                  <h3 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{p.automation.name}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-foreground/85">{p.automation.tagline}</p>
                </div>
                <div className="mt-10">
                  <AutomationChart rows={p.automation.rows} columns={p.automation.columns} />
                </div>
                <p className="mt-6 text-sm text-muted-foreground">{p.automation.stack}</p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Calculators */}
        <section id="tools" className="scroll-mt-20 border-y border-border bg-muted py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t.tools.title}</h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t.tools.intro}</p>
            </Reveal>
            <div className="mt-12">
              <ToolCards locale={locale} openLabel={t.tools.open} />
            </div>
          </div>
        </section>

        <Contact locale={locale} t={t.contact} />
      </main>

      <Footer locale={locale} t={t.footer} />
    </div>
  );
}
