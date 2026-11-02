'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import sk from '@/i18n/sk';
import en from '@/i18n/en';

export default function Error({ error, reset }) {
  const params = useParams();
  const t = (params?.locale === 'en' ? en : sk).error;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.body}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t.retry}
        </button>
      </div>
    </main>
  );
}
