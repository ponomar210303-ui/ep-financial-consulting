export const BASE_URL = 'https://epfinance.sk';
export const SITE_NAME = 'Evgenii Ponomarev';

// Real photo of Evgenii, background removed (retouched in Higgsfield).
// Set to null to show the neutral placeholder; the OG card is
// generated from text (app/[locale]/opengraph-image.jsx).
// Real studio photo on pure white; it blends into the white hero.
export const PROFILE_PHOTO = '/images/evgenii.webp';
export const PROFILE_PHOTO_JPG = '/images/evgenii.jpg';

export const CONTACT = {
  email: 'e.ponomarev2003@gmail.com',
  phone: '+421 910 650 045',
  phoneHref: 'https://wa.me/421910650045',
  linkedin: 'https://www.linkedin.com/in/evgenii-ponomarev-446023235',
};

export const AGROSTIT_VIDEO_ID = 'ztkJkWzBfTk';
export const AGROSTIT_SITE = 'https://agrostit.vercel.app/';
export const CHERRYPICKER_APP_STORE = 'https://apps.apple.com/sk/app/id6817686801';

// Returns absolute URL for OG/canonical fields. Accepts absolute http(s) URLs
// as-is and prefixes root-relative paths with BASE_URL.
export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return BASE_URL;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}
