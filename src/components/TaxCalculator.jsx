import { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import AnimatedSection from './AnimatedSection';

const ZDRAVOTNE_MIN = 91;    // €/month 2025
const SOCIALNE_MIN = 216;    // €/month 2025 (after 1st year)
const TAX_RATE_LOW = 0.15;
const TAX_RATE_HIGH = 0.25;
const TAX_THRESHOLD = 49790;
const PAUSALNE_RATE = 0.60;
const PAUSALNE_CAP = 20000;
const NEZDANITELNA = 4922.82; // non-taxable base 2025

function formatEur(val) {
  return new Intl.NumberFormat('sk-SK', { maximumFractionDigits: 0 }).format(val) + ' €';
}

export default function TaxCalculator() {
  const [income, setIncome] = useState(24000);
  const [mode, setMode] = useState('pausalne'); // 'pausalne' | 'realne'
  const [realExpenses, setRealExpenses] = useState(6000);
  const [firstYear, setFirstYear] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const calc = useMemo(() => {
    const annualIncome = income;

    // Expenses
    const expenses = mode === 'pausalne'
      ? Math.min(annualIncome * PAUSALNE_RATE, PAUSALNE_CAP)
      : realExpenses;

    const taxBase = Math.max(0, annualIncome - expenses - NEZDANITELNA);

    // Tax
    let tax = 0;
    if (taxBase <= TAX_THRESHOLD) {
      tax = taxBase * TAX_RATE_LOW;
    } else {
      tax = TAX_THRESHOLD * TAX_RATE_LOW + (taxBase - TAX_THRESHOLD) * TAX_RATE_HIGH;
    }

    // Zdravotné — 14% of (income - expenses), min 91€/mo
    const zdravotneBase = Math.max(0, annualIncome - expenses);
    const zdravotneAnnual = Math.max(ZDRAVOTNE_MIN * 12, zdravotneBase * 0.14);

    // Sociálne — first year free option
    const socialneAnnual = firstYear ? 0 : Math.max(SOCIALNE_MIN * 12, zdravotneBase * 0.333);

    const totalDeductions = tax + zdravotneAnnual + socialneAnnual;
    const netProfit = annualIncome - expenses - totalDeductions;
    const netMonthly = netProfit / 12;

    return {
      annualIncome,
      expenses,
      taxBase,
      tax,
      zdravotneMonthly: zdravotneAnnual / 12,
      socialneMonthly: firstYear ? 0 : socialneAnnual / 12,
      totalMonthly: totalDeductions / 12,
      netMonthly: Math.max(0, netMonthly),
      netAnnual: Math.max(0, netProfit),
      effectiveRate: annualIncome > 0 ? (totalDeductions / annualIncome) * 100 : 0,
    };
  }, [income, mode, realExpenses, firstYear]);

  const netPercent = income > 0 ? Math.min(100, (calc.netMonthly * 12 / income) * 100) : 0;

  return (
    <AnimatedSection>
      <div className="glass rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] -z-10" />

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calculator className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Калькулятор налогов</h3>
            <p className="text-sm text-muted-foreground">Примерный расчёт для živnostník в 2025</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — inputs */}
          <div className="space-y-6">
            {/* Annual income slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium">Годовой доход</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">€</span>
                  <Input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-28 h-8 text-sm bg-background/50 border-border/50 rounded-lg text-right font-mono"
                  />
                </div>
              </div>
              <Slider
                value={[income]}
                onValueChange={([v]) => setIncome(v)}
                min={0}
                max={100000}
                step={500}
                className="py-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 €</span>
                <span>100 000 €</span>
              </div>
            </div>

            {/* Mode toggle */}
            <div>
              <label className="text-sm font-medium block mb-3">Система расходов</label>
              <div className="flex rounded-xl overflow-hidden border border-border/50">
                <button
                  onClick={() => setMode('pausalne')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'pausalne' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Paušálne (60%)
                </button>
                <button
                  onClick={() => setMode('realne')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'realne' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Реальные расходы
                </button>
              </div>
            </div>

            {/* Real expenses */}
            {mode === 'realne' && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium">Расходы в год</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">€</span>
                    <Input
                      type="number"
                      value={realExpenses}
                      onChange={(e) => setRealExpenses(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-28 h-8 text-sm bg-background/50 border-border/50 rounded-lg text-right font-mono"
                    />
                  </div>
                </div>
                <Slider
                  value={[realExpenses]}
                  onValueChange={([v]) => setRealExpenses(v)}
                  min={0}
                  max={income}
                  step={500}
                  className="py-1"
                />
              </div>
            )}

            {/* First year toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Первый год živnosti</span>
                <div className="group relative">
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-lg glass text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    В первый год живности sociálne poistenie не платится, если доход за год ниже порога.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFirstYear(!firstYear)}
                className={`w-11 h-6 rounded-full transition-colors relative ${firstYear ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${firstYear ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Right — results */}
          <div className="space-y-4">
            {/* Net monthly — hero result */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <div className="text-sm text-muted-foreground mb-1">Чистая прибыль в месяц</div>
              <div className="text-4xl font-black gradient-text font-mono">
                {formatEur(calc.netMonthly)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatEur(calc.netAnnual)} в год · эффективная ставка {calc.effectiveRate.toFixed(1)}%
              </div>
              {/* Net income bar */}
              <div className="mt-4 h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${netPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Налоги и взносы</span>
                <span>Чистая прибыль {netPercent.toFixed(0)}%</span>
              </div>
            </div>

            {/* Monthly deductions summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-muted/20">
                <span className="text-sm text-muted-foreground">Расходы (в год)</span>
                <span className="font-mono text-sm font-medium">{formatEur(calc.expenses)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-muted/20">
                <span className="text-sm text-muted-foreground">Daň z príjmov / мес</span>
                <span className="font-mono text-sm font-medium">{formatEur(calc.tax / 12)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-muted/20">
                <span className="text-sm text-muted-foreground">Zdravotné / мес</span>
                <span className="font-mono text-sm font-medium">{formatEur(calc.zdravotneMonthly)}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-4 rounded-xl bg-muted/20">
                <span className="text-sm text-muted-foreground">Sociálne / мес</span>
                <span className="font-mono text-sm font-medium">
                  {firstYear ? '0 € (1-й год)' : formatEur(calc.socialneMonthly)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 px-4 rounded-xl border border-primary/20 bg-primary/5">
                <span className="text-sm font-semibold">Итого отчислений / мес</span>
                <span className="font-mono text-sm font-bold text-primary">{formatEur(calc.totalMonthly)}</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              * Расчёт приблизительный, ставки 2025 года. Для точного расчёта — запишитесь на консультацию.
            </p>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}