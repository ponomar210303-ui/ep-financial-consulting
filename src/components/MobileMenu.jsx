import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const links = [
  { label: 'Услуги', href: '#services' },
  { label: 'Обо мне', href: '#about' },
  { label: 'Инструменты', href: '#tools' },
  { label: 'Блог', href: '/blog', external: true },
  { label: 'Контакт', href: '#contact' },
];

export default function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleClick = (href, external) => {
    onClose();
    if (external) { navigate(href); return; }
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
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleClick(link.href, link.external)}
              className="text-left text-2xl font-semibold py-3 px-2 rounded-lg hover:bg-accent transition-colors"
            >
              {link.label}
            </button>
          ))}
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