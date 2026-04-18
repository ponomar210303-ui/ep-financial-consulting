import { getAllPosts } from '@/lib/blog';
import tools from '@/config/tools';
import { BASE_URL } from '@/lib/site';

export default async function sitemap() {
  const posts = await getAllPosts();

  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/tools`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const toolRoutes = tools.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const blogRoutes = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated || p.date,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
