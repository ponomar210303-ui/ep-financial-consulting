import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import tools from '../config/tools';

export default function ToolsSection() {
  return (
    <section id="tools" className="py-24 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[180px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              Это тебе может <span className="gradient-text">пригодиться</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Бесплатные инструменты для предпринимателей в Словакии
            </p>
          </div>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <AnimatedSection key={tool.id} delay={i * 80}>
              <Link
                to={`/tools/${tool.slug}`}
                className="group block w-full text-left glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:glow-blue relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                <div className="relative flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 transition-transform`}>
                    {tool.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                    <div className={`mt-4 inline-flex items-center text-sm font-semibold gap-2 group-hover:gap-3 transition-all ${tool.iconColor}`}>
                      Открыть <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
