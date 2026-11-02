import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { getAllPosts } from '@/lib/blog';
import BlogIndexClient from './BlogIndexClient';

export const metadata = {
  title: 'Блог — EP. Финансовый консалтинг',
  description:
    'Полезные статьи о налогах, živnosť и финансах в Словакии для русскоязычных предпринимателей.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Блог — EP. Финансовый консалтинг',
    description: 'Полезные статьи о налогах, živnosť и финансах в Словакии.',
    url: '/blog',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'EP. Финансовый консалтинг',
    images: ['/images/about.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Блог — EP.',
    description: 'Полезные статьи о налогах, živnosť и финансах в Словакии.',
    images: ['/images/about.png'],
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-black mb-4">
                <span className="gradient-text">Полезное</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Статьи о налогах, бизнесе и жизни предпринимателя в Словакии
              </p>
            </div>
          </AnimatedSection>

          <BlogIndexClient posts={posts} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
