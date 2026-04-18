'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Surface to console for debugging; Vercel Analytics will pick up page errors
    // automatically via the runtime.
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p className="text-sm font-mono text-muted-foreground">500</p>
        <h1 className="text-3xl sm:text-4xl font-black">
          Что-то пошло <span className="gradient-text">не так</span>
        </h1>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка. Можно попробовать ещё раз или вернуться на
          главную — я уже получил уведомление и разберусь.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Повторить
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors font-semibold"
          >
            На главную
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          Если ошибка повторяется — напиши мне на{' '}
          <a
            href="mailto:ponomarev.businessonly@gmail.com"
            className="underline hover:text-foreground"
          >
            ponomarev.businessonly@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
