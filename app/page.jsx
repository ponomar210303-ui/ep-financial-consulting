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

const ABOUT_PHOTO = '/images/about.webp';
const OG_IMAGE = '/images/about.jpg';

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
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EP. — Финансовый консалтинг в Словакии',
    description:
      'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии.',
    images: [OG_IMAGE],
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
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bratislava',
      addressCountry: 'SK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.1486,
      longitude: 17.1077,
    },
    areaServed: 'SK',
    inLanguage: ['ru', 'sk', 'en'],
    telephone: '+421910650045',
    email: 'ponomarev.businessonly@gmail.com',
    priceRange: '€€',
    image: `${BASE_URL}${OG_IMAGE}`,
    sameAs: [
      'https://wa.me/421910650045',
      'https://calendar.app.google/JmVTFpHUB3szUqoK7',
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main id="main-content">
      <Hero />
      <About photoUrl={ABOUT_PHOTO} />
      <WhyMe />
      <Services />
      <HowItWorks />
      <ToolsSection />
      <BlogSection posts={posts} />
      <Contact />
      </main>
      <Footer />
    </div>
  );
}
