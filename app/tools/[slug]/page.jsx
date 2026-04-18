import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import tools from '@/config/tools';
import ToolLoader from './ToolLoader';
import { BASE_URL } from '@/lib/site';

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({ params }) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) return {};
  const title = `${tool.title} — EP. Финансовый консалтинг`;
  const url = `/tools/${tool.slug}`;
  return {
    title,
    description: tool.desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: tool.desc,
      url,
      type: 'website',
      locale: 'ru_RU',
      siteName: 'EP. Финансовый консалтинг',
      images: ['/images/about.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: tool.desc,
      images: ['/images/about.jpg'],
    },
  };
}

export default function ToolPage({ params }) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) notFound();

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Инструменты', item: `${BASE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.title, item: `${BASE_URL}/tools/${tool.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Все инструменты
            </Link>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 text-2xl`}>
                {tool.emoji}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">{tool.title}</h1>
                <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8">
            <ToolLoader slug={tool.slug} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
