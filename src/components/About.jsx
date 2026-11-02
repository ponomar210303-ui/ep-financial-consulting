import { CONTACT } from '@/lib/site';

export default function About({ t }) {
  return (
    <section id="about" className="scroll-mt-20 border-y border-border bg-muted py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t.title}</h2>
          <div className="mt-6 max-w-[65ch] space-y-5 text-lg leading-relaxed text-foreground/85">
            {t.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <aside className="self-start rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          <h3 className="font-display text-lg font-semibold">{t.factsTitle}</h3>
          <dl className="mt-4 divide-y divide-border">
            {t.facts.map((f) => (
              <div key={f.term} className="grid gap-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
                <dt className="text-sm text-muted-foreground">{f.term}</dt>
                <dd className="text-sm">{f.value}</dd>
              </div>
            ))}
          </dl>
          <a
            href={CONTACT.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t.cv}
          </a>
        </aside>
      </div>
    </section>
  );
}
