'use client';
import { useState } from 'react';
import { Calculator, GitCompare, FileText, AlertTriangle, X, ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import TaxCalcSZCO from './tools/TaxCalcSZCO';
import ZivnostComparison from './tools/ZivnostComparison';
import InvoiceGenerator from './tools/InvoiceGenerator';
import PenaltyCalc from './tools/PenaltyCalc';

const tools = [
  {
    id: 'tax',
    emoji: '🧮',
    icon: Calculator,
    title: 'Калькулятор налогов SZČO',
    desc: 'Введи годовой доход — узнай налог, отчисления в страховые и чистую прибыль на руки. С круговой диаграммой.',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    Component: TaxCalcSZCO,
  },
  {
    id: 'comparison',
    emoji: '⚖️',
    icon: GitCompare,
    title: 'Živnosť vs s.r.o. vs TPP',
    desc: 'Введи желаемый доход на руки — покажу, какая форма выгоднее и сколько сэкономишь.',
    color: 'from-secondary/20 to-secondary/5',
    iconColor: 'text-secondary',
    Component: ZivnostComparison,
  },
  {
    id: 'invoice',
    emoji: '📄',
    icon: FileText,
    title: 'Генератор инвойсов',
    desc: 'Заполни форму — скачай готовую фактуру по словацким требованиям в PDF. Данные продавца сохраняются.',
    color: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-500',
    Component: InvoiceGenerator,
  },
  {
    id: 'penalty',
    emoji: '⚠️',
    icon: AlertTriangle,
    title: 'Калькулятор штрафов',
    desc: 'Пропустил срок или не зарегистрировался вовремя? Узнай, сколько это стоит.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-500',
    Component: PenaltyCalc,
  },
];

export default function ToolsSection() {
  const [activeTool, setActiveTool] = useState(null);
  const active = tools.find((t) => t.id === activeTool);

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
              <button
                onClick={() => setActiveTool(tool.id)}
                className="group w-full text-left glass rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:glow-blue relative overflow-hidden"
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
              </button>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setActiveTool(null)}>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{active.emoji}</span>
                <h3 className="font-bold text-lg">{active.title}</h3>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <active.Component />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}