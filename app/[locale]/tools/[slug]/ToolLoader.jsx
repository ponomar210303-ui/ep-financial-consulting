'use client';
import dynamic from 'next/dynamic';
import { useContext, createContext } from 'react';

// ssr: false forces each calculator into its own lazy client bundle. Trims the
// shared /tools/* page JS by ~120 KB since the 4 calculators never share a
// route. The `loading` placeholder keeps layout stable while the chunk fetches.
const LoadingText = createContext('');

function Loading() {
  const text = useContext(LoadingText);
  return <div className="py-12 text-center text-sm text-muted-foreground">{text}</div>;
}

const loading = () => <Loading />;

const Calculators = {
  'tax-calc': dynamic(() => import('@/components/tools/TaxCalcSZCO'), { ssr: false, loading }),
  'comparison': dynamic(() => import('@/components/tools/ZivnostComparison'), { ssr: false, loading }),
  'invoice': dynamic(() => import('@/components/tools/InvoiceGenerator'), { ssr: false, loading }),
  'penalty': dynamic(() => import('@/components/tools/PenaltyCalc'), { ssr: false, loading }),
};

export default function ToolLoader({ slug, locale, loadingText }) {
  const Calculator = Calculators[slug];
  if (!Calculator) return null;
  return (
    <LoadingText.Provider value={loadingText}>
      <Calculator locale={locale} />
    </LoadingText.Provider>
  );
}
