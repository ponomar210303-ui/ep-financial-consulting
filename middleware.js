import { NextResponse } from 'next/server';
import { locales, defaultLocale } from '@/i18n/config';

// Pages hidden during the redesign: send old links to the home page instead of a 404.
const HIDDEN = /^\/(blog|rss\.xml|thank-you)(\/|$)/;

function preferredLocale(request) {
  const header = request.headers.get('accept-language') || '';
  for (const part of header.split(',')) {
    const lang = part.split(';')[0].trim().slice(0, 2).toLowerCase();
    if (lang === 'sk' || lang === 'cs') return 'sk';
    if (lang === 'en') return 'en';
  }
  return defaultLocale;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];
  if (locales.includes(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const rest = pathname === '/' || HIDDEN.test(pathname) ? '' : pathname;
  url.pathname = `/${preferredLocale(request)}${rest}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)', '/rss.xml'],
};
