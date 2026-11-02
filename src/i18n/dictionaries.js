import sk from './sk';
import en from './en';

const dictionaries = { sk, en };

export function getDictionary(locale) {
  return dictionaries[locale] ?? dictionaries.sk;
}
