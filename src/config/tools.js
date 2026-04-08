import { Calculator, GitCompare, FileText, AlertTriangle } from 'lucide-react';

export const CONSULTATION_URL = 'https://calendar.app.google/JmVTFpHUB3szUqoK7';

const tools = [
  {
    id: 'tax',
    slug: 'tax-calc',
    emoji: '🧮',
    icon: Calculator,
    title: 'Калькулятор налогов SZČO',
    desc: 'Введи годовой доход — узнай налог, отчисления в poisťovňa и чистую прибыль на руки. С круговой диаграммой.',
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    id: 'comparison',
    slug: 'comparison',
    emoji: '⚖️',
    icon: GitCompare,
    title: 'Živnosť vs s.r.o. vs TPP',
    desc: 'Введи желаемый доход на руки — покажу, какая форма выгоднее и сколько сэкономишь.',
    color: 'from-secondary/20 to-secondary/5',
    iconColor: 'text-secondary',
  },
  {
    id: 'invoice',
    slug: 'invoice',
    emoji: '📄',
    icon: FileText,
    title: 'Генератор инвойсов',
    desc: 'Заполни форму — скачай готовую фактуру по словацким требованиям в PDF. Данные продавца сохраняются.',
    color: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-500',
  },
  {
    id: 'penalty',
    slug: 'penalty',
    emoji: '⚠️',
    icon: AlertTriangle,
    title: 'Калькулятор штрафов',
    desc: 'Пропустил срок или не зарегистрировался вовремя? Узнай, сколько это стоит.',
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-500',
  },
];

export default tools;
