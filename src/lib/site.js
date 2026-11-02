export const BASE_URL = 'https://epfinance.sk';
export const SITE_NAME = 'Evgenii Ponomarev';

// Real photo of Evgenii goes here (e.g. '/images/evgenii.webp', 4:5 crop).
// While it is null the site shows a neutral placeholder and the OG card is
// generated from text (app/[locale]/opengraph-image.jsx).
export const PROFILE_PHOTO = null;

export const CONTACT = {
  email: 'e.ponomarev2003@gmail.com',
  phone: '+421 910 650 045',
  phoneHref: 'https://wa.me/421910650045',
  linkedin: 'https://www.linkedin.com/in/evgenii-ponomarev-446023235',
};

export const AGROSTIT_VIDEO_ID = 'ztkJkWzBfTk';
export const CHERRYPICKER_APP_STORE = 'https://apps.apple.com/sk/app/id6817686801';

// Returns absolute URL for OG/canonical fields. Accepts absolute http(s) URLs
// as-is and prefixes root-relative paths with BASE_URL.
export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return BASE_URL;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
