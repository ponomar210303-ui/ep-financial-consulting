import { useState } from 'react';
import { Send, MessageCircle, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AnimatedSection from './AnimatedSection';

// Получи бесплатный ключ на https://web3forms.com → Enter your email
const WEB3FORMS_KEY = '929e8f83-7c01-4eea-a57e-0e73be12b604';

const contactCards = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+421 910 650 045',
    href: 'https://wa.me/421910650045',
    color: 'from-green-500/20 to-green-600/20',
  },
  {
    icon: Calendar,
    label: 'Google Calendar',
    value: 'Забронировать звонок',
    href: 'https://calendar.app.google/JmVTFpHUB3szUqoK7',
    color: 'from-primary/20 to-primary/10',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'ponomarev.businessonly@gmail.com',
    href: 'mailto:ponomarev.businessonly@gmail.com',
    color: 'from-secondary/20 to-secondary/10',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: form.name,
          email: form.email,
          phone: form.phone || '—',
          message: form.message,
          subject: `Новое сообщение от ${form.name} — epfinance.sk`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Сообщение отправлено! Свяжусь с вами в ближайшее время.');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(data.message || 'Ошибка отправки');
      }
    } catch {
      toast.error('Не удалось отправить. Напишите напрямую на ponomarev.businessonly@gmail.com');
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Давай <span className="gradient-text">поговорим</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Первая консультация — бесплатно. Серьёзно.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-5xl mx-auto">
          {/* Form */}
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-5">
              <div>
                <Input
                  placeholder="Имя"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                />
              </div>
              <div>
                <Input
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Расскажи коротко о своей ситуации..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  className="bg-background/50 border-border/50 rounded-xl resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                disabled={sending}
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Отправить
                  </>
                )}
              </Button>
            </form>
          </AnimatedSection>

          {/* Quick contact cards */}
          <AnimatedSection delay={100}>
            <div className="space-y-4 lg:pt-4">
              {contactCards.map((card, i) => (
                <a
                  key={i}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:glow-blue"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">{card.label}</div>
                    <div className="text-sm text-muted-foreground">{card.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}