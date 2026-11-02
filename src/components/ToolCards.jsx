import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import tools, { toolText } from '@/config/tools';
import Reveal from './motion/Reveal';

export default function ToolCards({ locale, openLabel }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {tools.map((tool, i) => {
        const text = toolText(tool, locale);
        return (
          <Reveal as="li" key={tool.slug} delay={i * 0.06}>
            <Link
              href={`/${locale}/tools/${tool.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-[1.75rem] leading-none transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true">
                {tool.emoji}
              </span>
              <span className="mt-5 block font-display text-xl font-semibold">{text.title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{text.desc}</span>
              <span className="mt-auto pt-6">
                <span className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground pl-5 pr-4 text-sm font-medium text-background transition-colors duration-300 group-hover:bg-primary">
                  {openLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
