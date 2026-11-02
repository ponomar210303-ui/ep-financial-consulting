import { Calculator, GitCompare, FileText, AlertTriangle } from 'lucide-react';

// Kept for the hidden Russian pages; the calculators no longer link to it.
export const CONSULTATION_URL = 'https://calendar.app.google/JmVTFpHUB3szUqoK7';

const tools = [
  {
    id: 'tax',
    slug: 'tax-calc',
    emoji: '🧮',
    icon: Calculator,
    text: {
      sk: {
        title: 'Dane a odvody SZČO',
        desc: 'Zadáte ročný príjem a uvidíte daň, odvody do poisťovní a čistý príjem.',
      },
      en: {
        title: 'SZČO tax and contributions',
        desc: 'Enter your annual income to see income tax, social and health contributions, and what is left.',
      },
      ru: {
        title: 'Калькулятор налогов SZČO',
        desc: 'Введи годовой доход — узнай налог, отчисления в poisťovňa и чистую прибыль на руки. С круговой диаграммой.',
      },
    },
  },
  {
    id: 'comparison',
    slug: 'comparison',
    emoji: '⚖️',
    icon: GitCompare,
    text: {
      sk: {
        title: 'Živnosť, s.r.o. alebo TPP',
        desc: 'Zadáte, koľko chcete mať v čistom, a uvidíte, ktorá forma vyjde najvýhodnejšie.',
      },
      en: {
        title: 'Živnosť vs s.r.o. vs employment',
        desc: 'Enter the net income you want and see which setup works out best.',
      },
      ru: {
        title: 'Živnosť vs s.r.o. vs TPP',
        desc: 'Введи желаемый доход на руки — покажу, какая форма выгоднее и сколько сэкономишь.',
      },
    },
  },
  {
    id: 'invoice',
    slug: 'invoice',
    emoji: '📄',
    icon: FileText,
    text: {
      sk: {
        title: 'Generátor faktúr',
        desc: 'Vyplníte údaje a stiahnete faktúru v PDF s QR kódom PAY by square. Údaje dodávateľa zostanú vo vašom prehliadači.',
      },
      en: {
        title: 'Invoice generator',
        desc: 'Fill in the details and download a PDF invoice with a PAY by square QR code. Supplier details stay in your browser.',
      },
      ru: {
        title: 'Генератор инвойсов',
        desc: 'Заполни форму — скачай готовую фактуру по словацким требованиям в PDF. Данные продавца сохраняются.',
      },
    },
  },
  {
    id: 'penalty',
    slug: 'penalty',
    emoji: '⚠️',
    icon: AlertTriangle,
    text: {
      sk: {
        title: 'Pokuty za zmeškané termíny',
        desc: 'Zistíte, koľko stojí neskoré podanie alebo neskorá registrácia.',
      },
      en: {
        title: 'Late filing penalties',
        desc: 'See what a late filing or a late registration costs.',
      },
      ru: {
        title: 'Калькулятор штрафов',
        desc: 'Пропустил срок или не зарегистрировался вовремя? Узнай, сколько это стоит.',
      },
    },
  },
];

export function toolText(tool, locale) {
  return tool.text[locale] ?? tool.text.sk;
}

export default tools;
