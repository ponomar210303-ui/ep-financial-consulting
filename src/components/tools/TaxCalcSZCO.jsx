'use client';
import { useId, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ─── 2025 Slovak SZČO rates (szcokalkulacka.sk verified) ────────
const ZM = 273.99;                              // životné minimum 2025
const AVG_SALARY_2023 = 1430;                   // priemerná mzda 2023
const AVG_SALARY_2024 = 1524;                   // priemerná mzda 2024
const INSURANCE_COEF = 1.486;                   // koeficient pre VZ

const PAUSALNE_RATE = 0.60;
const PAUSALNE_CAP = 20000;

const NEZDANITELNA_CAST = ZM * 21;              // 5 753.79 €
const NEZDANITELNA_LIMIT = ZM * 92.8;           // hranica pre krátenie NČZD
const NEZDANITELNA_COEF = ZM * 44.2;            // koeficient pre krátenie

const TAX_RATE_SMALL = 0.15;                    // príjem ≤ 100 000 €
const TAX_RATE_LOW = 0.19;                      // 1. pásmo
const TAX_RATE_HIGH = 0.25;                     // 2. pásmo
const TAX_BRACKET = ZM * 176.8;                 // 48 421.03 € — hranica pásiem
const SMALL_BIZ_LIMIT = 100000;                 // hranica pre 15% sadzbu

const ZDRAVOTNA_RATE = 0.15;                    // 15% pre SZČO v 2025
const ZDRAVOTNA_MIN_VZ = AVG_SALARY_2023 * 0.5; // 715.00 €/mes

const SOCIALNA_RATES = { nem: 0.044, star: 0.18, inv: 0.06, rez: 0.0475 };
const SOCIALNA_TOTAL = 0.3315;
const SOCIALNA_MIN_VZ = AVG_SALARY_2024 * 0.5;  // 762.00 €/mes
const SOCIALNA_MAX_VZ = AVG_SALARY_2024 * 7;    // 10 668.00 €/mes
const SOCIALNA_INCOME_LIMIT = AVG_SALARY_2024 * 12 * 0.5; // hranica pre povinnosť

const STRINGS = {
  sk: {
    income: 'Ročný príjem (príjmy)',
    expenseType: 'Typ výdavkov',
    pausalne: 'Paušálne (60 %)',
    skutocne: 'Skutočné',
    realExpenses: 'Skutočné výdavky za rok',
    startDate: 'Dátum začiatku živnosti',
    monthsInYear: (m) => `${m} mes. v tomto roku`,
    startDateHintSet: (m) => `Výpočet za ${m} mes. aktuálneho roka`,
    startDateHintEmpty: 'Ak dátum nezadáte, počíta sa 12 mesiacov',
    firstYear: 'Prvý rok (bez sociálneho poistenia)',
    perYear: 'Ročne',
    perMonth: 'Mesačne',
    period: 'Zobrazenie',
    netYear: 'Čistý príjem ročne',
    netMonth: 'Čistý príjem mesačne',
    effectiveRate: 'Efektívne zaťaženie',
    chartNet: 'Čistý príjem',
    chartTax: 'Daň',
    chartHealth: 'Zdravotné poistenie',
    chartSocial: 'Sociálne poistenie',
    breakdownYear: 'Podrobný výpočet (ročne)',
    breakdownMonth: 'Podrobný výpočet (mesačne)',
    rowGross: 'Príjmy',
    rowExpensesPausalne: 'Paušálne výdavky 60 %',
    rowExpensesReal: 'Skutočné výdavky',
    rowHealth: (p) => `Zdravotné poistenie (${p})`,
    rowSocial: (p) => `Sociálne poistenie (${p})`,
    rowNczd: 'Nezdaniteľná časť základu dane (NČZD)',
    rowTax: (r) => `Daň z príjmov (${r})`,
    rowNet: 'Čistý príjem',
    noSocial: (limit) => `Sociálne poistenie sa nepočíta, príjem je pod hranicou ${limit} ročne.`,
    smallBiz: (limit) => `Použitá sadzba 15 % (príjmy do ${limit}).`,
    basis: (zm, avg, coef, h, s) =>
      `Výpočet vychádza zo sadzieb pre rok 2025 (životné minimum ${zm}, priemerná mzda 2024: ${avg}). Koeficient pre vymeriavací základ: ${coef}. Zdravotné poistenie ${h}, sociálne poistenie ${s}.`,
    disclaimer: 'Výpočet je orientačný a nenahrádza daňové poradenstvo.',
  },
  en: {
    income: 'Annual income (príjmy)',
    expenseType: 'Expense type',
    pausalne: 'Flat-rate (60%)',
    skutocne: 'Actual',
    realExpenses: 'Actual expenses for the year',
    startDate: 'Trade licence (živnosť) start date',
    monthsInYear: (m) => `${m} mo. this year`,
    startDateHintSet: (m) => `Calculated for ${m} mo. of the current year`,
    startDateHintEmpty: 'If left empty, 12 months are used',
    firstYear: 'First year (no Sociálna poisťovňa contributions)',
    perYear: 'Yearly',
    perMonth: 'Monthly',
    period: 'View',
    netYear: 'Net income per year',
    netMonth: 'Net income per month',
    effectiveRate: 'Effective burden',
    chartNet: 'Net income',
    chartTax: 'Income tax',
    chartHealth: 'Health insurance',
    chartSocial: 'Social insurance',
    breakdownYear: 'Detailed calculation (yearly)',
    breakdownMonth: 'Detailed calculation (monthly)',
    rowGross: 'Income (príjmy)',
    rowExpensesPausalne: 'Flat-rate expenses 60%',
    rowExpensesReal: 'Actual expenses',
    rowHealth: (p) => `Health insurance, Zdravotná poisťovňa (${p})`,
    rowSocial: (p) => `Social insurance, Sociálna poisťovňa (${p})`,
    rowNczd: 'Non-taxable part of the tax base (NČZD)',
    rowTax: (r) => `Income tax (${r})`,
    rowNet: 'Net income',
    noSocial: (limit) => `Social insurance is not charged because income is below ${limit} per year.`,
    smallBiz: (limit) => `The 15% rate is applied (income up to ${limit}).`,
    basis: (zm, avg, coef, h, s) =>
      `Based on 2025 rates (subsistence minimum ${zm}, average wage 2024: ${avg}). Assessment base coefficient: ${coef}. Health insurance ${h}, social insurance ${s}.`,
    disclaimer: 'This is an estimate, not tax advice.',
  },
  ru: {
    income: 'Годовой доход (príjmy)',
    expenseType: 'Тип расходов (výdavky)',
    pausalne: 'Paušálne (60%)',
    skutocne: 'Skutočné',
    realExpenses: 'Сумма реальных расходов за год',
    startDate: 'Дата открытия živnosť',
    monthsInYear: (m) => `${m} мес. в этом году`,
    startDateHintSet: (m) => `Расчёт за ${m} мес. текущего года`,
    startDateHintEmpty: 'Если не указана — расчёт за 12 месяцев',
    firstYear: 'Первый год (без socialného poistenia)',
    perYear: 'В год',
    perMonth: 'В месяц',
    period: 'Период',
    netYear: 'Чистыми в год',
    netMonth: 'Чистыми в месяц',
    effectiveRate: 'Эффективная ставка',
    chartNet: 'Чистыми',
    chartTax: 'Налог',
    chartHealth: 'Мед.Отчисления',
    chartSocial: 'Соц.Отчисления',
    breakdownYear: 'Детальный расчёт (в год)',
    breakdownMonth: 'Детальный расчёт (в мес.)',
    rowGross: 'Доход (príjmy)',
    rowExpensesPausalne: 'Паушальные расходы 60% (никому не платишь)',
    rowExpensesReal: 'Реальные расходы',
    rowHealth: (p) => `Мед.Отчисления (${p})`,
    rowSocial: (p) => `Соц.Отчисления (${p})`,
    rowNczd: 'NČZD (необлагаемый минимум)',
    rowTax: (r) => `Налог на прибыль (${r})`,
    rowNet: 'Остаётся чистыми',
    noSocial: (limit) => `Социальное страхование не начисляется — доход ниже порога (${limit}/год).`,
    smallBiz: (limit) => `Применена ставка 15% (príjem ≤ ${limit}).`,
    basis: (zm, avg, coef, h, s) =>
      `* Расчёт на основе ставок 2025 г. (ŽM ${zm}, priem. mzda 2024: ${avg}). Коэффициент VZ: ${coef}. Здравотное ${h}, социальное ${s}.`,
    disclaimer: 'Не является налоговой консультацией.',
    // Old CTA text, kept for reference only (not rendered).
    oldCta: 'Для точного анализа — запишись на консультацию',
  },
};

function makeFormatters(locale) {
  const tag = locale === 'en' ? 'en-GB' : 'sk-SK';
  const eur0 = new Intl.NumberFormat(tag, {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const eur2 = new Intl.NumberFormat(tag, {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  const pct = (n, digits) => new Intl.NumberFormat(tag, {
    style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(n);
  return { fmt: (n) => eur0.format(n), fmtExact: (n) => eur2.format(n), pct };
}

function floorTo2(n) {
  return Math.floor(n * 100) / 100;
}

function calcSocialInsurance(vz, isRetired) {
  return floorTo2(vz * SOCIALNA_RATES.nem)
    + floorTo2(vz * SOCIALNA_RATES.star)
    + floorTo2(vz * (isRetired ? 0 : SOCIALNA_RATES.inv))
    + floorTo2(vz * SOCIALNA_RATES.rez);
}

const INPUT_CLASS =
  'w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary';

function NumberInput({ value, onChange, label, suffix = '€', min = 0, max = 999999 }) {
  const id = useId();
  const [raw, setRaw] = useState(String(value));

  const handleChange = (e) => {
    const text = e.target.value;
    setRaw(text);
    const num = parseFloat(text);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    } else if (text === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    setRaw(String(value));
  };

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={raw}
          onFocus={() => { if (value === 0) setRaw(''); }}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${INPUT_CLASS} pr-9 font-mono tabular-nums`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

/** Počet mesiacov činnosti v aktuálnom roku podľa dátumu začiatku */
function calcMonthsFromDate(dateStr) {
  if (!dateStr) return 12;
  const start = new Date(dateStr);
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const effectiveStart = start > yearStart ? start : yearStart;
  const monthsRaw = (now.getFullYear() - effectiveStart.getFullYear()) * 12
    + now.getMonth() - effectiveStart.getMonth() + 1;
  return Math.max(1, Math.min(12, monthsRaw));
}

export default function TaxCalcSZCO({ locale = 'sk' }) {
  const t = STRINGS[locale] ?? STRINGS.sk;
  const { fmt, fmtExact, pct } = makeFormatters(locale);

  const incomeId = useId();
  const dateId = useId();
  const firstYearId = useId();

  const [income, setIncome] = useState(30000);
  const [incomeRaw, setIncomeRaw] = useState('30000');
  const [expenseType, setExpenseType] = useState('pausalne');
  const [realExpenses, setRealExpenses] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [firstYear, setFirstYear] = useState(false);
  const [showMonthly, setShowMonthly] = useState(false);

  const monthsActive = calcMonthsFromDate(startDate);

  const result = useMemo(() => {
    const gross = income;

    // 1. Výdavky
    const expenses = expenseType === 'pausalne'
      ? Math.min(gross * PAUSALNE_RATE, PAUSALNE_CAP)
      : realExpenses;

    // 2. Čiastkový základ dane (ČZD)
    const czd = Math.max(0, gross - expenses);

    // 3. Zdravotné poistenie (15%)
    //    VZ = ČZD / monthsActive / 1.486
    const rawHealthVZ = monthsActive > 0 ? czd / monthsActive / INSURANCE_COEF : 0;
    const healthMonthlyVZ = Math.max(rawHealthVZ, ZDRAVOTNA_MIN_VZ);
    const healthMonthly = floorTo2(healthMonthlyVZ * ZDRAVOTNA_RATE);
    const zdravotna = healthMonthly * monthsActive;

    // 4. Sociálne poistenie (33.15%)
    let socialna = 0;
    let socialMonths = 0;
    if (!firstYear && gross > SOCIALNA_INCOME_LIMIT) {
      socialMonths = monthsActive;
      const rawSocialVZ = czd / 12 / INSURANCE_COEF;
      const socialMonthlyVZ = Math.min(
        Math.max(rawSocialVZ, SOCIALNA_MIN_VZ),
        SOCIALNA_MAX_VZ
      );
      const socialMonthly = calcSocialInsurance(socialMonthlyVZ, false);
      socialna = socialMonthly * socialMonths;
    }

    // 5. Základ dane = ČZD - odvody
    const zakladDane = Math.max(0, czd - zdravotna - socialna);

    // 6. Nezdaniteľná časť (s krátením pri vyššom príjme)
    let nezdanitelna;
    if (zakladDane <= NEZDANITELNA_LIMIT) {
      nezdanitelna = NEZDANITELNA_CAST;
    } else {
      nezdanitelna = Math.max(0, NEZDANITELNA_COEF - zakladDane * 0.25);
    }
    nezdanitelna = Math.min(nezdanitelna, zakladDane);

    // 7. Zdaniteľný základ
    const zdanitelnyCZ = Math.max(0, zakladDane - nezdanitelna);

    // 8. Daň z príjmov (15% ak príjem ≤ 100k, inak 19%/25%)
    let tax = 0;
    if (gross <= SMALL_BIZ_LIMIT) {
      tax = zdanitelnyCZ * TAX_RATE_SMALL;
    } else {
      if (zdanitelnyCZ <= TAX_BRACKET) {
        tax = zdanitelnyCZ * TAX_RATE_LOW;
      } else {
        tax = TAX_BRACKET * TAX_RATE_LOW + (zdanitelnyCZ - TAX_BRACKET) * TAX_RATE_HIGH;
      }
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
      taxRate: gross <= SMALL_BIZ_LIMIT ? '15%' : '19/25%',
    };
  }, [income, expenseType, realExpenses, monthsActive, firstYear]);

  const div = showMonthly ? 12 : 1;

  const COLOR_NET = 'hsl(var(--chart-1))';
  const COLOR_TAX = 'hsl(var(--chart-2))';
  const COLOR_HEALTH = 'hsl(var(--chart-3))';
  const COLOR_SOCIAL = 'hsl(var(--chart-4))';

  const chartData = [
    { id: 'net', name: t.chartNet, value: Math.max(0, result.net), color: COLOR_NET },
    { id: 'tax', name: t.chartTax, value: Math.max(0, result.tax), color: COLOR_TAX },
    { id: 'health', name: t.chartHealth, value: Math.max(0, result.zdravotna), color: COLOR_HEALTH },
    { id: 'social', name: t.chartSocial, value: Math.max(0, result.socialna), color: COLOR_SOCIAL },
  ].filter((d) => d.value > 0);

  const breakdownRows = [
    { id: 'gross', label: t.rowGross, value: result.gross, bold: true },
    { id: 'expenses', label: expenseType === 'pausalne' ? t.rowExpensesPausalne : t.rowExpensesReal, value: -result.expenses },
    { id: 'health', label: t.rowHealth(pct(ZDRAVOTNA_RATE, 0)), value: -result.zdravotna, color: COLOR_HEALTH },
    { id: 'social', label: t.rowSocial(pct(SOCIALNA_TOTAL, 2)), value: -result.socialna, color: COLOR_SOCIAL, hide: result.socialna === 0 },
    { id: 'nczd', label: t.rowNczd, value: result.nezdanitelna, muted: true },
    { id: 'tax', label: t.rowTax(result.taxRate), value: -result.tax, color: COLOR_TAX },
    { id: 'net', label: t.rowNet, value: result.net, bold: true, color: COLOR_NET },
  ].filter((r) => !r.hide);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        {/* ───────── Inputs ───────── */}
        <section className="rounded-xl border border-border bg-background p-5 sm:p-6 space-y-5">

          {/* Income input */}
          <div>
            <label htmlFor={incomeId} className="text-sm font-medium">{t.income}</label>
            <div className="relative mt-1.5 mb-3">
              <input
                id={incomeId}
                type="text"
                inputMode="decimal"
                value={incomeRaw}
                onFocus={() => { if (income === 0) setIncomeRaw(''); }}
                onChange={(e) => {
                  const text = e.target.value;
                  setIncomeRaw(text);
                  const num = parseFloat(text);
                  if (!isNaN(num)) setIncome(Math.max(0, Math.min(100000, num)));
                  else if (text === '') setIncome(0);
                }}
                onBlur={() => setIncomeRaw(String(income))}
                className={`${INPUT_CLASS} pr-9 font-mono tabular-nums`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
            </div>
            <input
              type="range" min={0} max={100000} step={500}
              value={income}
              aria-label={t.income}
              onChange={(e) => { const v = +e.target.value; setIncome(v); setIncomeRaw(String(v)); }}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
              <span>{fmt(0)}</span><span>{fmt(100000)}</span>
            </div>
          </div>

          {/* Expense type */}
          <div>
            <p className="text-sm font-medium mb-1.5">{t.expenseType}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['pausalne', t.pausalne],
                ['skutocne', t.skutocne],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  aria-pressed={expenseType === val}
                  onClick={() => setExpenseType(val)}
                  className={`h-10 px-3 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                    expenseType === val
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-border text-foreground hover:border-primary/40'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Real expenses input (conditional) */}
          {expenseType === 'skutocne' && (
            <NumberInput
              label={t.realExpenses}
              value={realExpenses}
              onChange={setRealExpenses}
              max={income}
            />
          )}

          {/* Start date */}
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <label htmlFor={dateId} className="text-sm font-medium">{t.startDate}</label>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t.monthsInYear(monthsActive)}</span>
            </div>
            <input
              id={dateId}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={INPUT_CLASS}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {startDate ? t.startDateHintSet(monthsActive) : t.startDateHintEmpty}
            </p>
          </div>

          {/* First year toggle */}
          <div className="flex items-center gap-3">
            <button
              id={firstYearId}
              type="button"
              role="switch"
              aria-checked={firstYear}
              onClick={() => setFirstYear(!firstYear)}
              className={`w-11 h-6 shrink-0 rounded-full transition-colors flex items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                firstYear ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                firstYear ? 'translate-x-5' : ''
              }`} />
            </button>
            <label htmlFor={firstYearId} className="text-sm cursor-pointer">{t.firstYear}</label>
          </div>
        </section>

        {/* ───────── Results ───────── */}
        <section className="rounded-xl border border-border bg-muted p-5 sm:p-6 lg:sticky lg:top-24 space-y-5">

          {/* Monthly / Annual toggle */}
          <div role="group" aria-label={t.period} className="inline-flex rounded-lg border border-border bg-background p-0.5 text-sm">
            <button
              type="button"
              aria-pressed={!showMonthly}
              onClick={() => setShowMonthly(false)}
              className={`px-3 h-8 rounded-md font-medium transition-colors ${!showMonthly ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.perYear}
            </button>
            <button
              type="button"
              aria-pressed={showMonthly}
              onClick={() => setShowMonthly(true)}
              className={`px-3 h-8 rounded-md font-medium transition-colors ${showMonthly ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {t.perMonth}
            </button>
          </div>

          {/* Net income highlight */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <div className="text-sm text-muted-foreground">{showMonthly ? t.netMonth : t.netYear}</div>
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold text-foreground">{fmt(result.net / div)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{t.effectiveRate}</div>
              <div className="font-mono tabular-nums text-lg font-semibold">{result.effectiveRate.toFixed(1)} %</div>
            </div>
          </div>

          {/* Pie chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none" isAnimationActive={false}>
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v / div)} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
            {chartData.map((d) => (
              <div key={d.id} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground truncate">{d.name}</div>
                  <div className="font-mono tabular-nums font-semibold text-sm">{fmt(d.value / div)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ───────── Detailed breakdown ───────── */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border">
          <h3 className="font-display text-sm font-semibold">{showMonthly ? t.breakdownMonth : t.breakdownYear}</h3>
        </div>
        <div className="divide-y divide-border">
          {breakdownRows.map((row) => (
            <div
              key={row.id}
              className={`flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5 ${row.bold ? 'bg-muted' : ''}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {row.color && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />}
                <span className={`text-sm ${row.bold ? 'font-semibold text-foreground' : row.muted ? 'text-muted-foreground italic' : 'text-muted-foreground'}`}>{row.label}</span>
              </div>
              <span className={`font-mono text-sm tabular-nums whitespace-nowrap ${row.bold ? 'font-semibold' : ''} ${row.muted ? 'text-muted-foreground italic' : ''}`}>
                {row.muted ? '' : row.value < 0 ? '−' : ''}{fmtExact(Math.abs(row.value / div))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info about rates */}
      {(result.socialna === 0 && !firstYear) || income <= SMALL_BIZ_LIMIT ? (
        <div className="space-y-2">
          {result.socialna === 0 && !firstYear && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 text-amber-700 px-3 py-2 text-xs">
              {t.noSocial(fmt(SOCIALNA_INCOME_LIMIT))}
            </p>
          )}
          {income <= SMALL_BIZ_LIMIT && (
            <p className="rounded-lg border border-border bg-muted text-muted-foreground px-3 py-2 text-xs">
              {t.smallBiz(fmt(SMALL_BIZ_LIMIT))}
            </p>
          )}
        </div>
      ) : null}

      {/* Basis + disclaimer */}
      <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
        <p>
          {t.basis(
            fmtExact(ZM),
            fmt(AVG_SALARY_2024),
            INSURANCE_COEF,
            pct(ZDRAVOTNA_RATE, 0),
            pct(SOCIALNA_TOTAL, 2),
          )}
        </p>
        <p>{t.disclaimer}</p>
      </div>
    </div>
  );
}
