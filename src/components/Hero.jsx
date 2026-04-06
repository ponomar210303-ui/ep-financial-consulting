import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from './AnimatedSection';
import HeroAnimation from './HeroAnimation';

const avatars = [
  'bg-primary/60',
  'bg-secondary/60',
  'bg-primary/40',
  'bg-secondary/40',
  'bg-primary/80',
];

export default function Hero() {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium">
                Финансы без головной боли 🇸🇰
              </div>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                Открою živnosť, настрою учёт и объясню
                <span className="gradient-text"> всё по-человечески</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Ты приехал в Словакию строить бизнес — не разбираться в бюрократии. Я возьму это на себя.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 font-semibold text-base group"
                  asChild
                >
                  <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
                    Бесплатная консультация
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 font-semibold text-base border-border/50 hover:border-primary/50 hover:bg-primary/5"
                  asChild
                >
                  <a href="https://wa.me/421910650045" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Написать в WhatsApp
                  </a>
                </Button>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={400}>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {avatars.map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center`}
                    >
                      <span className="text-[10px] text-white font-bold">
                        {['А', 'М', 'Д', 'К', 'О'][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Уже помог <span className="text-foreground font-semibold">50+</span> предпринимателям
                </span>
              </div>
            </AnimatedSection>
          </div>

          {/* Right animation */}
          <AnimatedSection delay={200} className="hidden lg:block">
            <HeroAnimation />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}