'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { CheckCircle2, MessageCircle, Calendar, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ThankYouPage() {
  useEffect(() => {
    track('contact_form_submit');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-24"
      >
        <div className="max-w-xl text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 text-green-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Сообщение <span className="gradient-text">отправлено</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Спасибо! Свяжусь с тобой в ближайшее время — обычно в течение нескольких
            часов в рабочие дни.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href="https://wa.me/421910650045"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Написать в WhatsApp
            </a>
            <a
              href="https://calendar.app.google/JmVTFpHUB3szUqoK7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors font-semibold"
            >
              <Calendar className="h-4 w-4" />
              Забронировать звонок
            </a>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              На главную
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
