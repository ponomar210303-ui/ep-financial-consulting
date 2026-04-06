import { MessageSquare, Zap, Heart, Shield } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const comparison = [
  { them: 'Формальное общение на словацком', us: 'Всё на русском, как с другом' },
  { them: 'Ответ через неделю по email', us: 'Ответ в WhatsApp за час' },
  { them: 'Только ведение учёта', us: 'Стратегия + учёт + помощь с документами' },
];

const features = [
  {
    icon: MessageSquare,
    title: 'На твоём языке',
    desc: 'Всё общение на русском. Без языкового барьера.',
  },
  {
    icon: Zap,
    title: 'Быстро и без очередей',
    desc: 'Ответ в WhatsApp за час, не за неделю.',
  },
  {
    icon: Heart,
    title: 'Понятные объяснения',
    desc: 'Никакого бухгалтерского жаргона. Объясню как другу.',
  },
  {
    icon: Shield,
    title: 'Полное сопровождение',
    desc: 'От идеи до первого daňové priznanie.',
  },
];

export default function WhyMe() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-16 leading-tight">
            Почему я, а не
            <br />
            <span className="gradient-text">бухгалтерская контора?</span>
          </h2>
        </AnimatedSection>

        {/* Comparison table */}
        <AnimatedSection delay={100}>
          <div className="max-w-3xl mx-auto mb-20">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 gap-0">
                <div className="p-4 sm:p-6 border-b border-border/30 bg-destructive/5">
                  <span className="text-sm font-semibold text-muted-foreground">Бухгалтерская контора</span>
                </div>
                <div className="p-4 sm:p-6 border-b border-border/30 bg-primary/5">
                  <span className="text-sm font-bold gradient-text">EP.</span>
                </div>
                {comparison.map((row, i) => (
                  <div key={i} className="contents">
                    <div className="p-4 sm:p-6 border-b border-border/20 text-sm text-muted-foreground">
                      {row.them}
                    </div>
                    <div className="p-4 sm:p-6 border-b border-border/20 text-sm font-medium text-foreground">
                      ✅ {row.us}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="group glass rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-500 hover:glow-blue">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}