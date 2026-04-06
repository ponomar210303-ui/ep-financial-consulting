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

const ABOUT_PHOTO = 'https://media.base44.com/images/public/69d414bc41ee308b2992cc63/e33643230_generated_cd602d92.png';
const BLOG_IMAGES = [
  'https://media.base44.com/images/public/69d414bc41ee308b2992cc63/292f89ffb_generated_921b0648.png',
  'https://media.base44.com/images/public/69d414bc41ee308b2992cc63/7e84b47d7_generated_fa9b0de8.png',
  'https://media.base44.com/images/public/69d414bc41ee308b2992cc63/532e64ec7_generated_b02604b5.png',
];

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
      <BlogSection blogImages={BLOG_IMAGES} />
      <Contact />
      <Footer />
    </div>
  );
}