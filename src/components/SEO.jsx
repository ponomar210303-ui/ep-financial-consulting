import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://epfinance.sk';
const DEFAULT_IMAGE = `${BASE_URL}/images/about.png`;
const SITE_NAME = 'EP. Финансовый консалтинг';

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title || `${SITE_NAME} в Словакии | Евгений Пономарёв`;
  const fullImage = image
    ? image.startsWith('http') ? image : `${BASE_URL}${image}`
    : DEFAULT_IMAGE;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
