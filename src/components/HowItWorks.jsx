import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from './AnimatedSection';

const steps = [
  {
    num: '01',
    emoji: '📞',
    title: 'Бесплатный звонок',
    desc: '30 минут в Telegram или WhatsApp. Обсудим твою ситуацию, отвечу на вопросы.',
  },
  {
    num: '02',
    emoji: '📝',
    title: 'Индивидуальный план',
    desc: 'Получишь чёткий план: что делать, сколько стоит, какие сроки.',
  },
  {
    num: '03',
    emoji: '✅',
    title: 'Сопровождение',
    desc: 'Я рядом на каждом этапе. От регистрации до первой отчётности.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Три шага — и <span className="gradient-text">всё работает</span>
            </h2>
          </div>
        </AnimatedSection>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50" />

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 200}>
                <div className="relative text-center lg:text-center">
                  {/* Step number circle */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 relative">
                    <span className="text-2xl">{step.emoji}</span>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <span className="text-[10px] font-mono font-bold text-primary">{step.num}</span>
                    </div>
                  </div>

                  {/* Vertical line (mobile) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden w-px h-8 bg-gradient-to-b from-primary/50 to-transparent mx-auto -mt-2 mb-2" />
                  )}

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection delay={600}>
          <div className="text-center mt-16">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 font-semibold text-base group"
              asChild
            >
              <a href="https://calendar.app.google/JmVTFpHUB3szUqoK7" target="_blank" rel="noopener noreferrer">
                Записаться на бесплатную консультацию
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}