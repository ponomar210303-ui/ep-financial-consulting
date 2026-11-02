import { CONTACT } from '@/lib/site';
import Reveal from './motion/Reveal';
import Timeline from './Timeline';
import FlagText from './FlagText';
import Principles from './Principles';

export default function About({ t }) {
  return (
    <section id="about" className="scroll-mt-20 border-y border-border bg-muted py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{t.title}</h2>
          <div className="mt-8 max-w-[62ch] space-y-5 text-lg leading-relaxed text-foreground/85">
            {t.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>
                <FlagText text={p} />
              </p>
            ))}
          </div>
          <dl className="mt-10 grid gap-x-8 gap-y-4 border-t border-border pt-8 sm:grid-cols-2">
            {t.facts.map((f) => (
              <div key={f.term}>
                <dt className="text-sm text-muted-foreground">{f.term}</dt>
                <dd className="mt-0.5 text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex h-10 items-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.cv}
          </a>
        </Reveal>

        <Reveal delay={0.15} className="lg:pt-3">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
            <Timeline title={t.timelineTitle} items={t.timeline} />
          </div>
        </Reveal>

        <div className="lg:col-span-2">
          <Principles title={t.principlesTitle} items={t.principles} />
        </div>
      </div>
    </section>
  );
}
