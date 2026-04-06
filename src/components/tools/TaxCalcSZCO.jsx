import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ─── 2025 Slovak SZČO tax rates ─────────────────────────────────
const PAUSALNE_RATE = 0.60;
const PAUSALNE_CAP = 20000;
const NEZDANITELNA_CAST = 5753.79;       // 21 × ŽM (273.99)
const TAX_RATE_LOW = 0.19;
const TAX_RATE_HIGH = 0.25;
const TAX_BRACKET = 48441.43;            // 176.8 × ŽM
const ZDRAVOTNA_RATE = 0.14;
const SOCIALNA_RATE = 0.3315;
const MIN_VZ_MONTHLY = 652.00;
const MAX_VZ_SOCIALNA_MONTHLY = 9128.00;

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n);
}

function fmtExact(n) {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function NumberInput({ value, onChange, label, suffix = '€', min = 0, max = 999999 }) {
  return (
    <div>
      <label className="text-sm font-semibold text-muted-foreground">{label}</label>
      <div className="relative mt-1">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, +e.target.value || 0)))}
          className="w-full bg-background/50 border border-border/50 rounded-xl h-11 px-4 pr-10 text-sm font-semibold focus:outline-none focus:border-primary/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

export default function TaxCalcSZCO() {
  const [income, setIncome] = useState(30000);
  const [expenseType, setExpenseType] = useState('pausalne');
  const [realExpenses, setRealExpenses] = useState(0);
  const [monthsActive, setMonthsActive] = useState(12);
  const [firstYear, setFirstYear] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  const result = useMemo(() => {
    const gross = income;

    // 1. Výdavky
    const expenses = expenseType === 'pausalne'
      ? Math.min(gross * PAUSALNE_RATE, PAUSALNE_CAP)
      : realExpenses;

    // 2. Čiastkový základ dane
    const czd = Math.max(0, gross - expenses);

    // 3. Vymeriavací základ pre odvody
    const annualVZ = czd / 2;
    const rawMonthlyVZ = monthsActive > 0 ? annualVZ / monthsActive : 0;

    // 4. Zdravotné poistenie (14%)
    const healthMonthlyVZ = Math.max(rawMonthlyVZ, MIN_VZ_MONTHLY);
    const zdravotna = healthMonthlyVZ * ZDRAVOTNA_RATE * monthsActive;

    // 5. Sociálne poistenie (33.15%) — 0 ak prvý rok
    let socialna = 0;
    if (!firstYear) {
      const socialMonthlyVZ = Math.min(
        Math.max(rawMonthlyVZ, MIN_VZ_MONTHLY),
        MAX_VZ_SOCIALNA_MONTHLY
      );
      socialna = socialMonthlyVZ * SOCIALNA_RATE * monthsActive;
    }

    // 6. Základ dane (po odpočítaní odvodov)
    const zakladDane = Math.max(0, czd - zdravotna - socialna);

    // 7. Nezdaniteľná časť
    const nezdanitelna = zakladDane > 0 ? Math.min(NEZDANITELNA_CAST, zakladDane) : 0;
    const zdanitelnyCZ = Math.max(0, zakladDane - nezdanitelna);

    // 8. Daň z príjmov (19% / 25%)
    let tax = 0;
    if (zdanitelnyCZ <= TAX_BRACKET) {
      tax = zdanitelnyCZ * TAX_RATE_LOW;
    } else {
      tax = TAX_BRACKET * TAX_RATE_LOW + (zdanitelnyCZ - TAX_BRACKET) * TAX_RATE_HIGH;
    }

    // 9. Čistý príjem
    const totalOdvody = zdravotna + socialna;
    const net = gross - totalOdvody - tax;
    const effectiveRate = gross > 0 ? ((totalOdvody + tax) / gross) * 100 : 0;

    return {
      gross,
      expenses,
      czd,
      zdravotna,
      socialna,
      totalOdvody,
      zakladDane,
      nezdanitelna,
      tax,
      net,
      effectiveRate,
      monthlyNet: net / 12,
    };
  }, [income, expenseType, realExpenses, monthsActive, firstYear]);

  const div = showMonthly ? 12 : 1;

  const chartData = [
    { name: 'Чистыми', value: Math.max(0, result.net), color: '#22c55e' },
    { name: 'Налог', value: Math.max(0, result.tax), color: '#3b82f6' },
    { name: 'Здравотное', value: Math.max(0, result.zdravotna), color: '#a855f7' },
    { name: 'Социальное', value: Math.max(0, result.socialna), color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const breakdownRows = [
    { label: 'Доход (príjmy)', value: result.gross, bold: true },
    { label: expenseType === 'pausalne' ? 'Паушальные расходы (60%)' : 'Реальные расходы', value: -result.expenses },
    { label: 'Здравотное (14%)', value: -result.zdravotna, color: '#a855f7' },
    { label: 'Социальное (33.15%)', value: -result.socialna, color: '#f59e0b', hide: firstYear },
    { label: 'Налог на доход', value: -result.tax, color: '#3b82f6' },
    { label: 'Чистый доход', value: result.net, bold: true, color: '#22c55e' },
  ].filter((r) => !r.hide);

  return (
    <div className="space-y-5">

      {/* ── Income input ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-sm font-semibold">Годовой доход (príjmy)</label>
          <span className="text-primary font-bold text-lg">{fmt(income)}</span>
        </div>
        <input
          type="range" min={1000} max={200000} step={500}
          value={income} onChange={(e) => setIncome(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>€1 000</span><span>€200 000</span>
        </div>
      </div>

      {/* ── Expense type ── */}
      <div>
        <p className="text-sm font-semibold mb-2">Тип расходов (výdavky)</p>
        <div className="flex gap-2">
          {[
            ['pausalne', 'Paušálne (60%)'],
            ['skutocne', 'Skutočné'],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setExpenseType(val)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                expenseType === val
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Real expenses input (conditional) ── */}
      {expenseType === 'skutocne' && (
        <NumberInput
          label="Сумма реальных расходов за год"
          value={realExpenses}
          onChange={setRealExpenses}
          max={income}
        />
      )}

      {/* ── Months active ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-sm font-semibold">Месяцев деятельности</label>
          <span className="text-primary font-bold">{monthsActive}</span>
        </div>
        <input
          type="range" min={1} max={12} step={1}
          value={monthsActive} onChange={(e) => setMonthsActive(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>1 мес.</span><span>12 мес.</span>
        </div>
      </div>

      {/* ── First year toggle ── */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => setFirstYear(!firstYear)}
          className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 ${
            firstYear ? 'bg-primary' : 'bg-border'
          }`}
        >
          <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
            firstYear ? 'translate-x-5' : ''
          }`} />
        </div>
        <span className="text-sm">Первый год (без sociálne poistenie)</span>
      </label>

      {/* ── Monthly / Annual toggle ── */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          onClick={() => setShowMonthly(false)}
          className={`px-3 py-1 rounded-full transition-all ${!showMonthly ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`}
        >
          В год
        </button>
        <button
          onClick={() => setShowMonthly(true)}
          className={`px-3 py-1 rounded-full transition-all ${showMonthly ? 'bg-primary/20 text-primary font-semibold' : 'text-muted-foreground'}`}
        >
          В месяц
        </button>
      </div>

      {/* ── Net income highlight ── */}
      <div className="glass rounded-2xl p-5 border-l-4 border-green-500">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Чистыми {showMonthly ? 'в месяц' : 'в год'}</div>
            <div className="text-3xl font-black text-green-500">{fmt(result.net / div)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Эффективная ставка</div>
            <div className="text-lg font-bold text-muted-foreground">{result.effectiveRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* ── Pie chart ── */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => fmt(v / div)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ── */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.map((d) => (
          <div key={d.name} className="flex items-center gap-2 glass rounded-xl p-2.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <div className="min-w-0">
              <div className="text-[11px] text-muted-foreground truncate">{d.name}</div>
              <div className="font-bold text-sm">{fmt(d.value / div)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Detailed breakdown ── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/30">
          <h4 className="text-sm font-bold">Детальный расчёт {showMonthly ? '(в мес.)' : '(в год)'}</h4>
        </div>
        <div className="divide-y divide-border/20">
          {breakdownRows.map((row) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-2.5 ${row.bold ? 'bg-card/50' : ''}`}
            >
              <div className="flex items-center gap-2">
                {row.color && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />}
                <span className={`text-sm ${row.bold ? 'font-bold' : 'text-muted-foreground'}`}>{row.label}</span>
              </div>
              <span className={`text-sm tabular-nums ${row.bold ? 'font-bold' : ''} ${row.value < 0 ? 'text-red-400/80' : ''}`}
                    style={row.color && row.bold ? { color: row.color } : undefined}
              >
                {row.value < 0 ? '−' : ''}{fmtExact(Math.abs(row.value / div))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        * Ориентировочный расчёт на основе ставок 2025 г. Не является налоговой консультацией.
        Для точного расчёта обратитесь к специалисту.
      </p>
    </div>
  );
}
