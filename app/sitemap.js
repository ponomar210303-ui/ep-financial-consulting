import tools from '@/config/tools';
import { locales, defaultLocale } from '@/i18n/config';
import { BASE_URL } from '@/lib/site';

// One entry per locale with hreflang alternates. The blog is hidden during the
// redesign and intentionally left out.
export default function sitemap() {
  const paths = [
    { path: '', changeFrequency: 'monthly', priority: 1.0 },
    { path: '/tools', changeFrequency: 'monthly', priority: 0.7 },
    ...tools.map((t) => ({ path: `/tools/${t.slug}`, changeFrequency: 'monthly', priority: 0.6 })),
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  ];

  return paths.flatMap(({ path, ...rest }) => {
    const languages = Object.fromEntries(locales.map((l) => [l, `${BASE_URL}/${l}${path}`]));
    languages['x-default'] = `${BASE_URL}/${defaultLocale}${path}`;
    return locales.map((l) => ({
      url: `${BASE_URL}/${l}${path}`,
      ...rest,
      alternates: { languages },
    }));
  });
}
