import Link from 'next/link';
import tools, { toolText } from '@/config/tools';
import Reveal from './motion/Reveal';

export default function ToolCards({ locale, openLabel }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {tools.map((tool, i) => {
        const text = toolText(tool, locale);
        const Icon = tool.icon;
        return (
          <Reveal as="li" key={tool.slug} delay={i * 0.06}>
            <Link
              href={`/${locale}/tools/${tool.slug}`}
              className="group flex h-full gap-5 rounded-2xl border border-border bg-background p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-xl font-semibold">{text.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{text.desc}</span>
                <span className="mt-4 block text-sm font-medium text-primary">{openLabel}</span>
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}
