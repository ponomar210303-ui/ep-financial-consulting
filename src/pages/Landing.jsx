import { useEffect } from 'react';
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
    // Set dark mode by default
    if (!localStorage.getItem('ep-theme')) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ep-theme', 'dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-700">
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