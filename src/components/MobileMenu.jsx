import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import tools from '../config/tools';

const links = [
  { label: 'Обо мне', href: '#about' },
  { label: 'Услуги', href: '#services' },
  { label: 'Инструменты', href: '/tools', hasDropdown: true },
  { label: 'Блог', href: '/blog', external: true },
  { label: 'Контакт', href: '#contact' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toolsExpanded, setToolsExpanded] = useState(false);

  if (!isOpen) return null;

  const handleClick = (href, external) => {
    onClose();
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
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />
      <div className="relative flex flex-col h-full p-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-col gap-2 mt-12">
          {links.map((link) =>
            link.hasDropdown ? (
              <div key={link.href}>
                <div className="flex items-center">
                  <button
                    onClick={() => { onClose(); navigate('/tools'); }}
                    className="text-left text-2xl font-semibold py-3 px-2 rounded-lg hover:bg-accent transition-colors flex-1"
                  >
                    {link.label}
                  </button>
                  <button
                    onClick={() => setToolsExpanded(!toolsExpanded)}
                    className="p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${toolsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {toolsExpanded && (
                  <div className="ml-4 flex flex-col gap-1 mt-1 mb-2">
                    {tools.map((tool) => (
                      <button
                        key={tool.slug}
                        onClick={() => { onClose(); navigate(`/tools/${tool.slug}`); }}
                        className="flex items-center gap-3 text-left py-2.5 px-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <span className="text-lg">{tool.emoji}</span>
                        <span className="text-base font-medium">{tool.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                key={link.href}
                onClick={() => handleClick(link.href, link.external)}
                className="text-left text-2xl font-semibold py-3 px-2 rounded-lg hover:bg-accent transition-colors"
              >
                {link.label}
              </button>
            )
          )}
        </nav>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold"
            onClick={() => handleClick('#contact')}
          >
            Записаться
          </Button>
          <div className="flex justify-center mt-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
