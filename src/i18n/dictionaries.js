import sk from './sk';
import en from './en';

// Slovak typography: a one-letter preposition or conjunction must not end a
// line, so glue it to the next word with a no-break space.
function glueShortWords(value) {
  if (typeof value === 'string') return value.replace(/(^|[\s(„])([aikosuvzAIKOSUVZ]) /g, '$1$2 ');
  if (Array.isArray(value)) return value.map(glueShortWords);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, glueShortWords(v)]));
  }
  return value;
}

const dictionaries = { sk: glueShortWords(sk), en };

export function getDictionary(locale) {
  return dictionaries[locale] ?? dictionaries.sk;
}
