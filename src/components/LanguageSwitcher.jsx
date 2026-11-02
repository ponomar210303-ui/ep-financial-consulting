'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/i18n/config';
import { FlagSK, FlagGB } from './Flags';

const FLAGS = { sk: FlagSK, en: FlagGB };

export default function LanguageSwitcher({ locale, labels }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');

  return (
    <div role="group" aria-label={labels.label} className="flex items-center gap-1">
      {locales.map((l) => {
        const Flag = FLAGS[l];
        const active = l === locale;
        return (
          <Link
            key={l}
            href={`/${l}${rest}`}
            hrefLang={l}
            lang={l}
            aria-current={active ? 'true' : undefined}
            title={labels[l]}
            className={`inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flag className="h-3 w-[18px] rounded-[2px] ring-1 ring-border" />
            {l.toUpperCase()}
            <span className="sr-only">{labels[l]}</span>
          </Link>
        );
      })}
    </div>
  );
}
