import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import WhyMe from '../components/WhyMe';
import Services from '../components/Services';
import HowItWorks from '../components/HowItWorks';
import About from '../components/About';
import BlogSection from '../components/BlogSection';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const ABOUT_PHOTO = '/__generating__/img_32855d94c41f.png';
const BLOG_IMAGES = [
  '/__generating__/img_336e123728f6.png',
  '/__generating__/img_a95840967756.png',
  '/__generating__/img_1512a5f37006.png',
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
      <WhyMe />
      <Services />
      <HowItWorks />
      <About photoUrl={ABOUT_PHOTO} />
      <BlogSection blogImages={BLOG_IMAGES} />
      <Contact />
      <Footer />
    </div>
  );
}