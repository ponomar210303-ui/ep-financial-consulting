'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import sk from '@/i18n/sk';
import en from '@/i18n/en';

export default function NotFound() {
  const params = useParams();
  const locale = params?.locale === 'en' ? 'en' : 'sk';
  const t = (locale === 'en' ? en : sk).notFound;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.body}</p>
        <Link
          href={`/${locale}`}
          className="mt-8 inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium hover:border-primary hover:text-primary"
        >
          {t.back}
        </Link>
      </div>
    </main>
  );
}
