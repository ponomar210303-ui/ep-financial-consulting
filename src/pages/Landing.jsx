import { useEffect } from 'react';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyMe from '../components/WhyMe';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import BlogSection from '../components/BlogSection';
import ToolsSection from '../components/ToolsSection';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const ABOUT_PHOTO = '/images/about.png';

export default function Landing() {
  useEffect(() => {
    if (!localStorage.getItem('ep-theme')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ep-theme', 'light');
    }
  }, []);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'EP. Финансовый консалтинг',
    url: 'https://epfinance.sk',
    description: 'Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии',
    founder: { '@type': 'Person', name: 'Евгений Пономарёв' },
    address: { '@type': 'PostalAddress', addressLocality: 'Bratislava', addressCountry: 'SK' },
    areaServed: 'SK',
    inLanguage: 'ru',
    image: 'https://epfinance.sk/images/about.png',
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
      <SEO
        title="EP. — Финансовый консалтинг в Словакии | Евгений Пономарёв"
        description="Открытие živnosť, ведение учёта, финансовая стратегия для русскоязычных предпринимателей в Словакии. Консультации на русском языке в Братиславе."
        image="/images/about.png"
        url="/"
        jsonLd={jsonLd}
      />
      <Navbar />
      <Hero />
      <About photoUrl={ABOUT_PHOTO} />
      <WhyMe />
      <Services />
      <HowItWorks />
      <ToolsSection />
      <BlogSection />
      <Contact />
      <Footer />
    </div>
  );
}