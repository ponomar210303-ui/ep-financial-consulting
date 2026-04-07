/**
 * Blog loader — reads Markdown files from src/content/blog/
 * via import.meta.glob (Vite, no server required).
 *
 * Each .md file must start with a YAML frontmatter block:
 *   ---
 *   title: "..."
 *   slug: "..."
 *   date: "2026-01-15"
 *   category: "Налоги"
 *   excerpt: "..."
 *   image: ""          # optional: /images/blog/my-image.jpg or external URL
 *   readingTime: 5
 *   ---
 */

// Load all .md files as raw strings at build time (eager = synchronous)
const rawFiles = import.meta.glob('../content/blog/*.md', { as: 'raw', eager: true });

/**
 * Minimal YAML frontmatter parser (no external deps).
 * Supports: strings (quoted or bare), numbers, booleans, empty values.
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw.trim() };

  const data = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === 'true') data[key] = true;
    else if (value === 'false') data[key] = false;
    else if (value !== '' && !isNaN(value)) data[key] = Number(value);
    else data[key] = value;
  }

  return { data, content: match[2].trim() };
}

/** Parse a single raw .md string into a post object. */
function parsePost(raw, filePath) {
  const { data, content } = parseFrontmatter(raw);
  // Derive slug from filename if not in frontmatter
  const fileSlug = filePath.replace(/^.*\//, '').replace(/\.md$/, '');
  return {
    slug: data.slug || fileSlug,
    title: data.title || '',
    date: data.date || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    image: data.image || '',
    readingTime: data.readingTime || data.reading_time || 5,
    content,
  };
}

/** Returns all posts sorted by date descending. */
export function getAllPosts() {
  return Object.entries(rawFiles)
    .map(([path, raw]) => parsePost(raw, path))
    .filter((p) => p.title)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/** Returns a single post by slug, or null if not found. */
export function getPostBySlug(slug) {
  return getAllPosts().find((p) => p.slug === slug) || null;
}
