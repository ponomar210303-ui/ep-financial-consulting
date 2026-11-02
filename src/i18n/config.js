// Active site languages. Russian texts are kept in the repo (app/_hidden,
// STRINGS.ru in the calculators) but are not routed while the site targets
// Slovak and English readers.
export const locales = ['sk', 'en'];
export const defaultLocale = 'sk';
export const hiddenLocales = ['ru'];

export const ogLocales = { sk: 'sk_SK', en: 'en_GB' };
export const numberLocales = { sk: 'sk-SK', en: 'en-GB' };

export function isLocale(value) {
  return locales.includes(value);
}

// canonical + hreflang for a path that exists in every locale ('' = home).
export function alternatesFor(locale, path = '') {
  const languages = Object.fromEntries(locales.map((l) => [l, `/${l}${path}`]));
  languages['x-default'] = `/${defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}
