'use client';
import dynamic from 'next/dynamic';

// ssr: false forces each calculator into its own lazy client bundle. Trims the
// shared /tools/* page JS by ~120 KB since the 4 calculators never share a
// route. The `loading` placeholder keeps layout stable while the chunk fetches.
const loading = () => (
  <div className="py-12 text-center text-muted-foreground text-sm">
    Загружаем калькулятор…
  </div>
);

const Calculators = {
  'tax-calc': dynamic(() => import('@/components/tools/TaxCalcSZCO'), { ssr: false, loading }),
  'comparison': dynamic(() => import('@/components/tools/ZivnostComparison'), { ssr: false, loading }),
  'invoice': dynamic(() => import('@/components/tools/InvoiceGenerator'), { ssr: false, loading }),
  'penalty': dynamic(() => import('@/components/tools/PenaltyCalc'), { ssr: false, loading }),
};

export default function ToolLoader({ slug }) {
  const Calculator = Calculators[slug];
  if (!Calculator) return null;
  return <Calculator />;
}
