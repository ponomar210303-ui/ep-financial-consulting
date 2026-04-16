export const BASE_URL = 'https://epfinance.sk';
export const SITE_NAME = 'EP. Финансовый консалтинг';
export const DEFAULT_OG_IMAGE = '/images/about.png';

// Returns absolute URL for OG/canonical fields. Accepts absolute http(s) URLs
// as-is and prefixes root-relative paths with BASE_URL.
export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return BASE_URL;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
