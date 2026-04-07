import { useState, useEffect } from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import tools from '../config/tools';

const links = [
  { label: 'Обо мне', href: '#about' },
  { label: 'Услуги', href: '#services' },
  { label: 'Инструменты', href: '/tools', hasDropdown: true },
  { label: 'Блог', href: '/blog', external: true },
  { label: 'Контакт', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (href, external) => {
    if (external) { navigate(href); return; }
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'glass-strong py-3 shadow-lg shadow-background/20'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => scrollTo('#hero')}>
            <Logo />
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) =>
              link.hasDropdown ? (
                <div key={link.href} className="relative group">
                  <button
                    onClick={() => navigate('/tools')}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                    <div className="glass-strong rounded-xl border border-border/50 shadow-xl py-2 min-w-[260px]">
                      {tools.map((tool) => (
                        <Link
                          key={tool.slug}
                          to={`/tools/${tool.slug}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors"
                        >
                          <span className="text-lg">{tool.emoji}</span>
                          <span className="text-sm font-medium">{tool.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href, link.external)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <Button
              size="sm"
              className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 font-semibold"
              onClick={() => scrollTo('#contact')}
            >
              Записаться
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
