/**
 * Blog loader — reads Markdown files from src/content/blog/ at build time
 * using Node's fs + gray-matter. Runs in Next.js Server Components only.
 *
 * Each .md file must start with a YAML frontmatter block:
 *   ---
 *   title: "..."
 *   slug: "..."
 *   date: "2026-01-15"
 *   updated: "2026-02-10"   # optional; falls back to date
 *   category: "Налоги"
 *   excerpt: "..."
 *   image: ""                # optional: /images/blog/my-image.jpg or external URL
 *   readingTime: 5
 *   ---
 */
import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function toPost(raw, fileSlug) {
  const { data, content } = matter(raw);
  return {
    slug: data.slug || fileSlug,
    title: data.title || '',
    date: data.date || '',
    updated: data.updated || data.date || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    image: data.image || '',
    readingTime: data.readingTime || data.reading_time || 5,
    content,
  };
}

/** Returns all posts sorted by date descending. */
export async function getAllPosts() {
  const files = await fs.readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter((f) => f.endsWith('.md'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(BLOG_DIR, file), 'utf-8');
        return toPost(raw, file.replace(/\.md$/, ''));
      })
  );
  return posts
    .filter((p) => p.title)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/** Returns a single post by slug, or null if not found. */
export async function getPostBySlug(slug) {
  const all = await getAllPosts();
  return all.find((p) => p.slug === slug) || null;
}
