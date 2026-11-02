import Link from 'next/link';
import { CONTACT, SITE_NAME } from '@/lib/site';

export default function Footer({ locale, t }) {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {SITE_NAME}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href={`mailto:${CONTACT.email}`} className="hover:text-foreground">{CONTACT.email}</a>
          <a href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">LinkedIn</a>
          <Link href={`/${locale}/privacy`} className="hover:text-foreground">{t.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
