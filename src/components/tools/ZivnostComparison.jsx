import { useState, useMemo } from 'react';

const TAX_NEZDANITELNA = 4922.82;
const TAX_RATE = 0.19;

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.abs(n));
}

function calcZivnost(netMonthly) {
  // Reverse-engineer gross from net for živnosť with paušálne
  // net = gross - tax - zdravotna - socialna
  // Approximate: iterate
  let gross = netMonthly * 12 * 1.4;
  for (let i = 0; i < 20; i++) {
    const expenses = Math.min(gross * 0.6, 20000);
    const taxBase = Math.max(0, gross - expenses - TAX_NEZDANITELNA);
    const tax = taxBase * TAX_RATE;
    const vym = Math.max(0, gross - expenses) * 0.5;
    const zdravotna = vym * 0.14;
    const socialna = vym * 0.337;
    const net = gross - tax - zdravotna - socialna;
    const diff = netMonthly * 12 - net;
    gross += diff * 0.7;
  }
  const expenses = Math.min(gross * 0.6, 20000);
  const taxBase = Math.max(0, gross - expenses - TAX_NEZDANITELNA);
  const tax = taxBase * TAX_RATE;
  const vym = Math.max(0, gross - expenses) * 0.5;
  const zdravotna = vym * 0.14;
  const socialna = vym * 0.337;
  return { gross, tax, zdravotna, socialna, totalCost: tax + zdravotna + socialna };
}

function calcSRO(netMonthly) {
  // s.r.o.: salary + dividend. Simplified: pay minimum salary, rest as dividend (7% tax)
  const net = netMonthly * 12;
  const minSalary = 750 * 12;
  const salaryGross = minSalary / (1 - 0.134 - 0.19); // approx
  const salaryNet = minSalary;
  const remaining = net - salaryNet;
  const dividendGross = remaining / (1 - 0.21 - 0.07); // corp tax 21% + div tax 7%
  const corpTax = dividendGross * 0.21;
  const divTax = (dividendGross - corpTax) * 0.07;
  const totalGross = salaryGross + dividendGross;
  return { gross: totalGross, totalCost: totalGross - net };
}

function calcTPP(netMonthly) {
  // Employee: net = gross * (1 - 0.134) - nezdanitelna/12 * 0.19 ... simplified
  let gross = netMonthly * 1.35;
  for (let i = 0; i < 15; i++) {
    const employeeContrib = gross * 0.134;
    const taxBase = Math.max(0, gross - employeeContrib - TAX_NEZDANITELNA / 12);
    const tax = taxBase * TAX_RATE;
    const net = gross - employeeContrib - tax;
    gross += (netMonthly - net) * 0.8;
  }
  const employeeContrib = gross * 0.134;
  const taxBase = Math.max(0, gross - employeeContrib - TAX_NEZDANITELNA / 12);
  const tax = taxBase * TAX_RATE;
  const employerContrib = gross * 0.351;
  const totalCostEmployer = (gross + employerContrib) * 12;
  return { gross: gross * 12, employerTotal: totalCostEmployer, totalCost: totalCostEmployer - netMonthly * 12 };
}

export default function ZivnostComparison() {
  const [netMonthly, setNetMonthly] = useState(2000);

  const z = useMemo(() => calcZivnost(netMonthly), [netMonthly]);
  const s = useMemo(() => calcSRO(netMonthly), [netMonthly]);
  const t = useMemo(() => calcTPP(netMonthly), [netMonthly]);

  const options = [
    { label: 'Živnosť + paušálne', cost: z.totalCost, color: 'border-primary', badge: 'text-primary bg-primary/10', icon: '🟢' },
    { label: 's.r.o. (мин. зарплата + дивиденды)', cost: s.totalCost, color: 'border-secondary', badge: 'text-secondary bg-secondary/10', icon: '🟣' },
    { label: 'TPP (работа по найму)', cost: t.totalCost, color: 'border-amber-500', badge: 'text-amber-500 bg-amber-500/10', icon: '🟡' },
  ].sort((a, b) => a.cost - b.cost);

  const best = options[0];
  const worst = options[options.length - 1];
  const saving = worst.cost - best.cost;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-semibold">Желаемый доход на руки / мес</label>
          <span className="text-primary font-bold">{fmt(netMonthly)} / мес</span>
        </div>
        <input
          type="range" min={800} max={10000} step={100}
          value={netMonthly} onChange={(e) => setNetMonthly(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>€800</span><span>€10 000</span>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {options.map((opt, i) => (
          <div key={opt.label} className={`glass rounded-xl p-4 border-l-4 ${opt.color} flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{opt.icon}</span>
              <div className="min-w-0">
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground">Отчисления государству в год</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-black text-lg">{fmt(opt.cost)}</div>
              {i === 0 && <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.badge}`}>Выгоднее всего</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion */}
      <div className="glass rounded-xl p-5 border border-primary/30 bg-primary/5">
        <p className="text-sm font-semibold leading-relaxed">
          💡 При доходе <strong>{fmt(netMonthly)}/мес</strong> тебе выгоднее <strong>{best.label}</strong> — сэкономишь <strong className="text-green-500">{fmt(saving)} в год</strong> по сравнению с {worst.label}.
        </p>
      </div>

      <p className="text-xs text-muted-foreground text-center">Расчёт приблизительный, на основе ставок 2025 года. Для точного анализа — <button onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-primary underline">запишись на консультацию</button>.</p>
    </div>
  );
}