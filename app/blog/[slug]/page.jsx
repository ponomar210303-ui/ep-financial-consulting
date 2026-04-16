import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { BASE_URL, absoluteUrl } from '@/lib/site';

const categoryColors = {
  'Živnosť': 'bg-primary/10 text-primary',
  'Налоги': 'bg-secondary/10 text-secondary',
  'Лайфхаки': 'bg-green-500/10 text-green-500',
  'Бизнес': 'bg-amber-500/10 text-amber-500',
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  const image = post.image || '/images/about.png';
  return {
    title: `${post.title} — EP.`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      locale: 'ru_RU',
      siteName: 'EP. Финансовый консалтинг',
      images: [absoluteUrl(image)],
      publishedTime: post.date || undefined,
      modifiedTime: post.updated || post.date || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [absoluteUrl(image)],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const formattedDate = post.date
    ? new Date(post.date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    image: post.image ? absoluteUrl(post.image) : `${BASE_URL}/images/about.png`,
    author: { '@type': 'Person', name: 'Евгений Пономарёв', url: BASE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'EP. Финансовый консалтинг',
      url: BASE_URL,
    },
    mainEntityOfPage: `${BASE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 pt-28 pb-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к блогу
        </Link>

        {post.category && (
          <div className="mb-4">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-muted text-muted-foreground'}`}>
              {post.category}
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-5 text-sm text-muted-foreground mb-12 pb-8 border-b border-border/30">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readingTime} мин чтения
          </div>
        </div>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-2xl mb-10 object-cover max-h-80"
          />
        )}

        <div className="prose prose-neutral dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-foreground
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground
          prose-li:text-muted-foreground
          prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground
          prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:rounded
          prose-pre:bg-card prose-pre:border prose-pre:border-border/50
          prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground
          prose-hr:border-border/30
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        <div className="mt-16 pt-8 border-t border-border/30">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Все статьи
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
