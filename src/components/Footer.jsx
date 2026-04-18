'use client';
import Link from 'next/link';
import Logo from './Logo';

// TODO: вписать реальный IČO после получения выписки из живности
const ICO = '__IČO__';

export default function Footer() {
  return (
    <footer className="relative py-16 border-t border-border/30 overflow-hidden">
      {/* Background large EP. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[25vw] font-black font-inter text-foreground/[0.02] leading-none">
          EP<span className="text-primary/[0.05]">.</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3">
            <Logo size="text-3xl" />
            <p className="text-sm text-muted-foreground max-w-sm">
              Evgenii Ponomarev - Účtovníctvo a financie pre podnikateľov
            </p>
            <p className="text-sm text-muted-foreground">
              Bratislava, Slovakia · IČO: {ICO}
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <a
              href="https://wa.me/421910650045"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:ponomarev.businessonly@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Email
            </a>
            <button
              onClick={() => document.querySelector('#blog')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Блог
            </button>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Конфиденциальность
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 EP. Všetky práva vyhradené.
          </p>
        </div>
      </div>
    </footer>
  );
}