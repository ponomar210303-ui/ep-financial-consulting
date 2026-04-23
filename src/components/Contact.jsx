'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Send, MessageCircle, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AnimatedSection from './AnimatedSection';

// Получи бесплатный ключ на https://web3forms.com → Enter your email
const WEB3FORMS_KEY = '929e8f83-7c01-4eea-a57e-0e73be12b604';

const schema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа'),
  email: z.string().trim().email('Неверный формат email'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^[+\d\s\-()]{6,}$/.test(v),
      'Похоже, телефон введён неправильно'
    ),
  message: z.string().trim().min(10, 'Расскажи чуть подробнее (минимум 10 символов)'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Нужно согласие на обработку данных' }),
  }),
  // Honeypot: реальные люди не заполняют скрытое поле, боты — заполняют.
  // Web3Forms сам отбрасывает submissions с непустым botcheck.
  botcheck: z.string().max(0, 'Поле должно быть пустым'),
});

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
    icon: Send,
    label: 'Telegram-блог',
    value: '@EPFinanceblog',
    href: 'https://t.me/EPFinanceblog',
    color: 'from-sky-500/20 to-sky-600/20',
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
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
      botcheck: '',
    },
  });

  const onSubmit = async (values) => {
    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: values.name,
          email: values.email,
          phone: values.phone || '—',
          message: values.message,
          subject: `Новое сообщение от ${values.name} — epfinance.sk`,
          botcheck: values.botcheck, // Web3Forms drop spam if non-empty
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Сообщение отправлено! Свяжусь с вами в ближайшее время.');
        reset();
        router.push('/thank-you');
      } else {
        throw new Error(data.message || 'Ошибка отправки');
      }
    } catch {
      toast.error(
        'Не удалось отправить. Напишите напрямую на ponomarev.businessonly@gmail.com'
      );
    }
    setSending(false);
  };

  const errId = (name) => (errors[name] ? `${name}-error` : undefined);

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
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="glass rounded-2xl p-8 space-y-5"
              aria-label="Контактная форма"
            >
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-sm font-medium">
                  Имя <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-name"
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errId('name')}
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                  {...register('name')}
                />
                {errors.name && (
                  <p id="name-error" role="alert" className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errId('email')}
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-sm font-medium">
                  Телефон{' '}
                  <span className="text-muted-foreground font-normal">
                    (необязательно)
                  </span>
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errId('phone')}
                  className="bg-background/50 border-border/50 rounded-xl h-12"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p id="phone-error" role="alert" className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-sm font-medium">
                  Сообщение <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Расскажи коротко о своей ситуации..."
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={errId('message')}
                  className="bg-background/50 border-border/50 rounded-xl resize-none"
                  {...register('message')}
                />
                {errors.message && (
                  <p
                    id="message-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Honeypot — visually hidden, hidden from AT */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              >
                <label htmlFor="botcheck">
                  Не заполняй это поле, если ты человек
                </label>
                <input
                  id="botcheck"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register('botcheck')}
                />
              </div>

              {/* GDPR consent */}
              <div className="space-y-1.5">
                <div className="flex items-start gap-3">
                  <Controller
                    control={control}
                    name="consent"
                    render={({ field }) => (
                      <Checkbox
                        id="contact-consent"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-required="true"
                        aria-invalid={!!errors.consent}
                        aria-describedby={errId('consent')}
                        className="mt-0.5"
                      />
                    )}
                  />
                  <Label
                    htmlFor="contact-consent"
                    className="text-xs text-muted-foreground leading-relaxed font-normal cursor-pointer"
                  >
                    Согласен на обработку персональных данных согласно{' '}
                    <Link
                      href="/privacy"
                      className="underline hover:text-foreground"
                    >
                      Политике конфиденциальности
                    </Link>
                    .
                  </Label>
                </div>
                {errors.consent && (
                  <p
                    id="consent-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.consent.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold"
                disabled={sending || isSubmitting}
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
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                  >
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
