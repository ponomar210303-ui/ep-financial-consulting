import { ClipboardList, BarChart3, Lightbulb, Rocket, ArrowRight } from 'lucide-react';
import TaxCalculator from './TaxCalculator';
import AnimatedSection from './AnimatedSection';

const services = [
  {
    icon: ClipboardList,
    emoji: '📋',
    title: 'Открытие živnosť',
    desc: 'Подберу коды, подготовлю документы, зарегистрирую. Ты подписываешь — я делаю остальное.',
  },
  {
    icon: BarChart3,
    emoji: '📊',
    title: 'Ведение учёта',
    desc: 'Jednoduché účtovníctvo, DPH, daňové priznanie. Ты занимаешься бизнесом — я считаю цифры.',
  },
  {
    icon: Lightbulb,
    emoji: '💡',
    title: 'Финансовая стратегия',
    desc: 'Paušálne výdavky или s.r.o.? Сколько платить в poisťovňu? Разберёмся вместе.',
  },
  {
    icon: Rocket,
    emoji: '🚀',
    title: 'Бизнес-консультация',
    desc: 'Запускаешь проект в Словакии? Помогу со структурой, бюджетом и первыми шагами.',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-[200px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Что я <span className="gradient-text">делаю</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Комплексное сопровождение для предпринимателей в Словакии
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div className="group relative glass rounded-2xl p-8 h-full overflow-hidden hover:border-primary/30 transition-all duration-500">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <span className="text-4xl mb-6 block">{s.emoji}</span>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
                  <button
                    onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-flex items-center text-sm font-semibold text-primary group-hover:gap-3 gap-2 transition-all"
                  >
                    Подробнее
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Tax Calculator */}
        <div className="mt-16">
          <AnimatedSection delay={100}>
            <h3 className="text-xl font-bold text-center mb-6 text-muted-foreground">
              Узнай сколько платишь государству 👇
            </h3>
          </AnimatedSection>
          <TaxCalculator />
        </div>
      </div>
    </section>
  );
}