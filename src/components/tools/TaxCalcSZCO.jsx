import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PAUSALNE_RATE = 0.6;
const PAUSALNE_CAP = 20000;
const TAX_NEZDANITELNA = 4922.82;
const TAX_RATE = 0.19;
const TAX_RATE_HIGH = 0.25;
const TAX_BRACKET = 41445.46;
const ZDRAVOTNA_RATE = 0.14;
const SOCIALNA_RATE = 0.337;
const VYMERIAVACI_MIN = 720;
const VYMERIAVACI_MAX_ZDRAVOTNA = 87384;
const VYMERIAVACI_MAX_SOCIALNA = 9128 * 12;

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function TaxCalcSZCO() {
  const [income, setIncome] = useState(30000);
  const [mode, setMode] = useState('pausalne');
  const [firstYear, setFirstYear] = useState(false);

  const result = useMemo(() => {
    const gross = income;
    let expenses;
    if (mode === 'pausalne') {
      expenses = Math.min(gross * PAUSALNE_RATE, PAUSALNE_CAP);
    } else {
      expenses = 0; // user sees 0 real expenses for demo
    }

    const taxBase = Math.max(0, gross - expenses - TAX_NEZDANITELNA);
    let tax = 0;
    if (taxBase <= TAX_BRACKET) {
      tax = taxBase * TAX_RATE;
    } else {
      tax = TAX_BRACKET * TAX_RATE + (taxBase - TAX_BRACKET) * TAX_RATE_HIGH;
    }

    const vymBase = Math.max(0, gross - expenses);
    const zdravVym = Math.min(vymBase * 0.5, VYMERIAVACI_MAX_ZDRAVOTNA);
    const zdravotna = Math.max(zdravVym * ZDRAVOTNA_RATE, VYMERIAVACI_MIN * ZDRAVOTNA_RATE * 12);

    let socialna = 0;
    if (!firstYear) {
      const socVym = Math.min(vymBase * 0.5, VYMERIAVACI_MAX_SOCIALNA);
      socialna = Math.max(socVym * SOCIALNA_RATE, VYMERIAVACI_MIN * SOCIALNA_RATE * 12);
    }

    const net = gross - tax - zdravotna - socialna;

    return { gross, tax, zdravotna, socialna, net, expenses };
  }, [income, mode, firstYear]);

  const chartData = [
    { name: 'На руки', value: Math.max(0, result.net), color: '#22c55e' },
    { name: 'Налог на доход', value: Math.max(0, result.tax), color: '#3b82f6' },
    { name: 'Zdravotná poisťovňa', value: Math.max(0, result.zdravotna), color: '#a855f7' },
    { name: 'Sociálna poisťovňa', value: Math.max(0, result.socialna), color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Income slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-semibold">Годовой доход</label>
          <span className="text-primary font-bold">{fmt(income)}</span>
        </div>
        <input
          type="range" min={5000} max={150000} step={1000}
          value={income} onChange={(e) => setIncome(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>€5 000</span><span>€150 000</span>
        </div>
      </div>

      {/* Mode toggle */}
      <div>
        <p className="text-sm font-semibold mb-2">Тип расходов</p>
        <div className="flex gap-2">
          {[['pausalne', 'Paušálne výdavky (60%)'], ['skutocne', 'Skutočné výdavky']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setMode(val)}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${mode === val ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/40'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === 'skutocne' && (
          <p className="text-xs text-muted-foreground mt-2">Для skutočné výdavky расчёт показан без вычета расходов (0 €). Введи реальные расходы в поле ниже.</p>
        )}
      </div>

      {/* First year toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setFirstYear(!firstYear)}
          className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${firstYear ? 'bg-primary' : 'bg-border'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${firstYear ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm">Первый год (освобождение от sociálna poisťovňa)</span>
      </label>

      {/* Pie chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + results */}
      <div className="grid grid-cols-2 gap-3">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 glass rounded-xl p-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <div>
              <div className="text-xs text-muted-foreground">{d.name}</div>
              <div className="font-bold text-sm">{fmt(d.value)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-xl p-4 border-l-4 border-green-500">
        <div className="text-sm text-muted-foreground">Чистыми в месяц</div>
        <div className="text-2xl font-black text-green-500">{fmt(result.net / 12)}</div>
      </div>
    </div>
  );
}