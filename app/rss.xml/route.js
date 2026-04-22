import { getAllPosts } from '@/lib/blog';
import { BASE_URL, SITE_NAME, absoluteUrl } from '@/lib/site';

// Static generation — фид пересобирается вместе с сайтом, когда правим
// markdown-посты. Никакого рантайма на каждом запросе не нужно.
export const dynamic = 'force-static';

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function mimeFromUrl(url) {
  const ext = url.split('.').pop()?.toLowerCase().split(/[?#]/)[0] || '';
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
  };
  return map[ext] || 'image/jpeg';
}

function toRFC822(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toUTCString();
}

export async function GET() {
  const posts = await getAllPosts();
  const feedUrl = `${BASE_URL}/rss.xml`;
  const lastBuildDate =
    toRFC822(posts[0]?.updated || posts[0]?.date) || new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = toRFC822(post.date);
      const image = post.image ? absoluteUrl(post.image) : '';
      const enclosure = image
        ? `\n      <enclosure url="${escapeXml(image)}" type="${mimeFromUrl(image)}" />`
        : '';
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      <description>${escapeXml(post.excerpt)}</description>${enclosure}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Блог</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
    <description>Живность, налоги и финансы для русскоязычных предпринимателей в Словакии. Автор — Евгений Пономарёв.</description>
    <language>ru</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>1440</ttl>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
