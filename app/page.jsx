import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyMe from '@/components/WhyMe';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import About from '@/components/About';
import BlogSection from '@/components/BlogSection';
import ToolsSection from '@/components/ToolsSection';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/lib/blog';
import { BASE_URL } from '@/lib/site';

const ABOUT_PHOTO = '/images/about.png';

export const metadata = {
  title: 'EP. — Финансовый консалтинг в Словакии | Евгений Пономарёв',
  description:
    'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии. Консультации на русском языке в Братиславе.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'EP. — Финансовый консалтинг в Словакии | Евгений Пономарёв',
    description:
      'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии.',
    url: '/',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'EP. Финансовый консалтинг',
    images: ['/images/about.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EP. — Финансовый консалтинг в Словакии',
    description:
      'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии.',
    images: ['/images/about.png'],
  },
};

export default async function LandingPage() {
  const posts = await getAllPosts();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'EP. Финансовый консалтинг',
    url: BASE_URL,
    description:
      'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии',
    founder: { '@type': 'Person', name: 'Евгений Пономарёв' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bratislava', addressCountry: 'SK' },
    areaServed: 'SK',
    inLanguage: 'ru',
    image: `${BASE_URL}/images/about.png`,
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <About photoUrl={ABOUT_PHOTO} />
      <WhyMe />
      <Services />
      <HowItWorks />
      <ToolsSection />
      <BlogSection posts={posts} />
      <Contact />
      <Footer />
    </div>
  );
}
