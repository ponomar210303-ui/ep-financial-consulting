import { useState, useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { CONSULTATION_URL } from '../../config/tools';

// ═══════════════════════════════════════════════════════════════════════
// 2026 SLOVAK TAX & INSURANCE RATES
// Zdroje: podnikajte.sk, socpoist.sk, finančná správa SR
// Dátum overenia: apríl 2026
// ═══════════════════════════════════════════════════════════════════════

// ── Базовые величины ──────────────────────────────────────────────────
const ZM = 284.13;                            // životné minimum od 1.7.2025
const AVG_SALARY_2024 = 1524;                 // priemerná mesačná mzda 2024
const INSURANCE_COEF = 1.486;                 // koeficient pre VZ

// ── Daň z príjmov FO ─────────────────────────────────────────────────
// SZČO s príjmom ≤ 100 000 €: rovná sadzba 15%
// SZČO s príjmom > 100 000 €: progresívne 4 pásma
const SMALL_BIZ_LIMIT = 100_000;
const SMALL_BIZ_RATE = 0.15;
const TAX_BANDS = [
  { limit: 43_983.32, rate: 0.19 },          // 154.8 × ŽM
  { limit: 60_349.21, rate: 0.25 },          // 212.4 × ŽM
  { limit: 75_010.32, rate: 0.30 },          // 264 × ŽM
  { limit: Infinity,  rate: 0.35 },
];

// Sadzby pre zamestnanca (TPP) — rovnaké 4 pásma
const TPP_TAX_BANDS = TAX_BANDS;

// ── Nezdaniteľná časť základu dane (NČZD) ────────────────────────────
const NCZD_FULL = ZM * 21;                   // 5 966.73 €/rok
const NCZD_LIMIT = ZM * 92.8;               // 26 367.26 — plná NČZD do tohto ZD
const NCZD_COEF = ZM * 44.2;                // 12 558.55 — koef. pre krátenie
const NCZD_REDUCTION_RATE = 0.25;

// ── Paušálne výdavky ──────────────────────────────────────────────────
const PAUSALNE_RATE = 0.60;
const PAUSALNE_CAP = 20_000;

// ── Zdravotné poistenie SZČO ──────────────────────────────────────────
const ZP_SZCO_RATE = 0.16;                   // 16% (bolo 15% v 2025)
const ZP_SZCO_MIN_VZ = AVG_SALARY_2024 * 0.5; // 762 €/mes

// ── Sociálne poistenie SZČO ──────────────────────────────────────────
const SP_SZCO_RATE = 0.3315;                 // 33.15%
const SP_SZCO_MIN_VZ = AVG_SALARY_2024 * 0.6; // 914.40 (bolo 50%, teraz 60%)
const SP_SZCO_MAX_VZ = AVG_SALARY_2024 * 11;  // 16 764 €/mes
const SP_SZCO_INCOME_LIMIT = AVG_SALARY_2024 * 12 * 0.5; // 9 144 — hranica povinnosti

// ── Korporátna daň (s.r.o.) ──────────────────────────────────────────
const CORP_TAX_LOW_RATE = 0.10;              // príjmy ≤ 100 000 € (bolo 15%)
const CORP_TAX_MID_RATE = 0.21;             // 100 001 – 5 000 000 €
const CORP_TAX_LOW_LIMIT = 100_000;

// ── Daň z dividend ───────────────────────────────────────────────────
const DIVIDEND_TAX = 0.07;                   // 7% (zisk od 1.1.2025)

// ── Minimálna mzda 2026 ──────────────────────────────────────────────
const MIN_WAGE = 915;                        // €/mes hrubá (1. stupeň)

// ── Odvody zamestnanec ────────────────────────────────────────────────
const EE_SOCIAL = 0.094;                     // 9.4% (1.4+4+3+1)
const EE_HEALTH = 0.05;                      // 5% (bolo 4%)
const EE_TOTAL = EE_SOCIAL + EE_HEALTH;      // 14.4%

// ── Odvody zamestnávateľ ─────────────────────────────────────────────
const ER_SOCIAL = 0.252;                     // 25.2% (1.4+14+3+1+0.8+0.25+4.75)
const ER_HEALTH = 0.11;                      // 11%
const ER_TOTAL = ER_SOCIAL + ER_HEALTH;      // 36.2%

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function floorTo2(n) {
  return Math.floor(n * 100) / 100;
}

/** Рассчитать НЧЗД с учётом крátения */
function calcNCZD(zakladDane) {
  if (zakladDane <= NCZD_LIMIT) return Math.min(NCZD_FULL, zakladDane);
  return Math.max(0, NCZD_COEF - zakladDane * NCZD_REDUCTION_RATE);
}

/** Прогрессивный налог по 4-пáсмовой шкале */
function calcProgressiveTax(taxableIncome) {
  let tax = 0;
  let prev = 0;
  for (const band of TAX_BANDS) {
    const chunk = Math.min(taxableIncome, band.limit) - prev;
    if (chunk <= 0) break;
    tax += chunk * band.rate;
    prev = band.limit;
  }
  return tax;
}

// ═══════════════════════════════════════════════════════════════════════
// SCENARIO CALCULATIONS (forward: gross → net)
// ═══════════════════════════════════════════════════════════════════════

/** Živnosť + paušálne výdavky: gross → breakdown */
function calcZivnostForward(grossAnnual, firstYear = false) {
  const expenses = Math.min(grossAnnual * PAUSALNE_RATE, PAUSALNE_CAP);
  const czd = Math.max(0, grossAnnual - expenses);

  // Zdravotné poistenie
  const rawHealthVZ = czd / 12 / INSURANCE_COEF;
  const healthMonthlyVZ = Math.max(rawHealthVZ, ZP_SZCO_MIN_VZ);
  const zdravotna = floorTo2(healthMonthlyVZ * ZP_SZCO_RATE) * 12;

  // Sociálne poistenie
  let socialna = 0;
  if (!firstYear && grossAnnual > SP_SZCO_INCOME_LIMIT) {
    const rawSocialVZ = czd / 12 / INSURANCE_COEF;
    const socialVZ = Math.min(Math.max(rawSocialVZ, SP_SZCO_MIN_VZ), SP_SZCO_MAX_VZ);
    socialna = floorTo2(socialVZ * SP_SZCO_RATE) * 12;
  }

  // Základ dane
  const zakladDane = Math.max(0, czd - zdravotna - socialna);
  const nczd = calcNCZD(zakladDane);
  const taxable = Math.max(0, zakladDane - nczd);

  // Daň
  let tax;
  if (grossAnnual <= SMALL_BIZ_LIMIT) {
    tax = taxable * SMALL_BIZ_RATE;
  } else {
    tax = calcProgressiveTax(taxable);
  }

  const net = grossAnnual - zdravotna - socialna - tax;
  const totalCost = zdravotna + socialna + tax;

  return { gross: grossAnnual, expenses, zdravotna, socialna, tax, nczd, net, totalCost };
}

/** s.r.o. (мин. зарплата директора + дивиденды): оборот → breakdown */
function calcSroForward(revenue) {
  // Зарплата директора = минимальная
  const salaryGross = MIN_WAGE;
  const eeContrib = floorTo2(salaryGross * EE_TOTAL);
  const erContrib = floorTo2(salaryGross * ER_TOTAL);
  const salaryTaxBase = Math.max(0, salaryGross - eeContrib - NCZD_FULL / 12);
  const salaryTax = Math.max(0, salaryTaxBase * TPP_TAX_BANDS[0].rate);
  const salaryNet = salaryGross - eeContrib - salaryTax;
  const salaryNetAnnual = salaryNet * 12;
  const salaryCostAnnual = (salaryGross + erContrib) * 12;

  // Прибыль компании (оборот - ЗП расходы)
  const companyProfit = Math.max(0, revenue - salaryCostAnnual);

  // Корпоративный налог
  const corpTaxRate = revenue <= CORP_TAX_LOW_LIMIT ? CORP_TAX_LOW_RATE : CORP_TAX_MID_RATE;
  const corpTax = companyProfit * corpTaxRate;
  const afterCorpTax = companyProfit - corpTax;

  // Дивиденды
  const divTax = afterCorpTax * DIVIDEND_TAX;
  const netDividends = afterCorpTax - divTax;

  const totalNet = salaryNetAnnual + netDividends;
  const totalCost = revenue - totalNet;

  return {
    gross: revenue,
    salaryGross: salaryGross * 12,
    salaryNet: salaryNetAnnual,
    eeContrib: eeContrib * 12,
    erContrib: erContrib * 12,
    salaryTax: salaryTax * 12,
    companyProfit,
    corpTax,
    corpTaxRate,
    divTax,
    netDividends,
    net: totalNet,
    totalCost,
  };
}

/** TPP (работа по найму): grossMonthly → breakdown */
function calcTppForward(grossAnnual) {
  const grossMonthly = grossAnnual / 12;
  const eeContrib = floorTo2(grossMonthly * EE_TOTAL);
  const erContrib = floorTo2(grossMonthly * ER_TOTAL);

  const taxBase = Math.max(0, grossMonthly - eeContrib - NCZD_FULL / 12);

  // Годовой налог — прогрессивная шкала
  const annualTaxBase = Math.max(0, grossAnnual - eeContrib * 12 - calcNCZD(grossAnnual - eeContrib * 12));
  const tax = calcProgressiveTax(annualTaxBase);

  const netAnnual = grossAnnual - eeContrib * 12 - tax;
  const employerCostAnnual = grossAnnual + erContrib * 12;
  const totalCost = employerCostAnnual - netAnnual;

  return {
    gross: grossAnnual,
    eeContrib: eeContrib * 12,
    erContrib: erContrib * 12,
    tax,
    net: netAnnual,
    employerCost: employerCostAnnual,
    totalCost,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// REVERSE CALCULATIONS (binary search: desired net → required gross)
// ═══════════════════════════════════════════════════════════════════════

function reverseCalc(forwardFn, targetNetAnnual, lo = 0, hi = 500_000) {
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const result = forwardFn(mid);
    if (result.net < targetNetAnnual) lo = mid;
    else hi = mid;
    if (hi - lo < 0.5) break;
  }
  return forwardFn((lo + hi) / 2);
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC CALCULATION API
// ═══════════════════════════════════════════════════════════════════════

function calculateZivnost(netMonthly, firstYear = false) {
  const target = netMonthly * 12;
  return reverseCalc((g) => calcZivnostForward(g, firstYear), target);
}

function calculateSro(netMonthly) {
  const target = netMonthly * 12;
  return reverseCalc((r) => calcSroForward(r), target, 0, 800_000);
}

function calculateTpp(netMonthly) {
  const target = netMonthly * 12;
  return reverseCalc((g) => calcTppForward(g), target);
}

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function TooltipIcon({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 p-3 rounded-xl glass border border-border/50 shadow-xl text-xs text-muted-foreground leading-relaxed">
            {text}
          </div>
        </>
      )}
    </span>
  );
}

function DetailRow({ label, value, bold, color, muted }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${bold ? 'font-bold' : ''}`}>
      <span className={`text-xs ${muted ? 'text-muted-foreground/50 italic' : bold ? '' : 'text-muted-foreground'}`}>{label}</span>
      <span
        className={`text-xs tabular-nums ${bold ? 'font-bold' : ''} ${muted ? 'text-muted-foreground/50' : ''} ${!muted && value < 0 ? 'text-red-400/70' : ''}`}
        style={color ? { color } : undefined}
      >
        {value < 0 ? '−' : ''}{fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function ScenarioCard({ label, icon, tooltip, result, borderColor, badgeClass, isBest, expanded, onToggle, detailRows }) {
  return (
    <div className={`glass rounded-xl border-l-4 ${borderColor} overflow-hidden transition-all`}>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{label}</span>
              <TooltipIcon text={tooltip} />
            </div>
            <div className="text-xs text-muted-foreground">Отчисления в год</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-black text-lg">{fmt(result.totalCost)}</div>
          {isBest && (
            <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
              Выгоднее всего
            </div>
          )}
        </div>
      </div>

      {/* Expand button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/20 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{expanded ? 'Скрыть' : 'Показать'} детали</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/10 space-y-0.5">
          {detailRows.map((row, i) => (
            <DetailRow key={i} {...row} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function ZivnostComparison() {
  const [netMonthly, setNetMonthly] = useState(2000);
  const [firstYear, setFirstYear] = useState(false);
  const [expanded, setExpanded] = useState({});

  const z = useMemo(() => calculateZivnost(netMonthly, firstYear), [netMonthly, firstYear]);
  const s = useMemo(() => calculateSro(netMonthly), [netMonthly]);
  const t = useMemo(() => calculateTpp(netMonthly), [netMonthly]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const scenarios = [
    {
      key: 'zivnost',
      label: 'Živnosť + paušálne',
      icon: '🟢',
      tooltip: 'Самозанятость (ИП). Паушальные расходы 60% — не нужно собирать чеки. Проще всего начать.',
      result: z,
      borderColor: 'border-primary',
      badgeClass: 'text-primary bg-primary/10',
      detailRows: [
        { label: 'Нужный оборот (príjmy)', value: z.gross, bold: true },
        { label: `Паушальные расходы (60%, макс. ${fmt(PAUSALNE_CAP)})`, value: -z.expenses },
        { label: `Здравотное (${ZP_SZCO_RATE * 100}%)`, value: -z.zdravotna },
        { label: `Социальное (${(SP_SZCO_RATE * 100).toFixed(2)}%)`, value: -z.socialna, muted: z.socialna === 0 },
        { label: 'НЧЗД', value: z.nczd, muted: true },
        { label: `Налог (${z.gross <= SMALL_BIZ_LIMIT ? '15%' : '19–35%'})`, value: -z.tax },
        { label: 'Чистыми в год', value: z.net, bold: true, color: '#22c55e' },
      ],
    },
    {
      key: 'sro',
      label: 's.r.o. (ЗП + дивиденды)',
      icon: '🟣',
      tooltip: 'ООО. Директор получает мин. зарплату (€915), остальное — дивиденды. Ограниченная ответственность.',
      result: s,
      borderColor: 'border-secondary',
      badgeClass: 'text-secondary bg-secondary/10',
      detailRows: [
        { label: 'Нужный оборот компании', value: s.gross, bold: true },
        { label: `ЗП директора (${fmt(MIN_WAGE)}/мес × 12)`, value: s.salaryGross },
        { label: 'Odvody работника', value: -s.eeContrib },
        { label: 'Odvody работодателя', value: -s.erContrib },
        { label: 'Налог на ЗП', value: -s.salaryTax },
        { label: 'Чистая ЗП директора', value: s.salaryNet, muted: true },
        { label: `Корп. налог (${(s.corpTaxRate * 100).toFixed(0)}%)`, value: -s.corpTax },
        { label: `Налог на дивиденды (${DIVIDEND_TAX * 100}%)`, value: -s.divTax },
        { label: 'Чистые дивиденды', value: s.netDividends, muted: true },
        { label: 'Итого на руки', value: s.net, bold: true, color: '#22c55e' },
      ],
    },
    {
      key: 'tpp',
      label: 'TPP (работа по найму)',
      icon: '🟡',
      tooltip: 'Трудовой договор. Работодатель платит все odvody. Самый простой вариант — но и самый дорогой для работодателя.',
      result: t,
      borderColor: 'border-amber-500',
      badgeClass: 'text-amber-500 bg-amber-500/10',
      detailRows: [
        { label: 'Нужная gross ЗП', value: t.gross, bold: true },
        { label: `Odvody работника (${(EE_TOTAL * 100).toFixed(1)}%)`, value: -t.eeContrib },
        { label: `Odvody работодателя (${(ER_TOTAL * 100).toFixed(1)}%)`, value: -t.erContrib },
        { label: 'Налог на доход', value: -t.tax },
        { label: 'Полная стоимость для работодателя', value: t.employerCost, muted: true },
        { label: 'Чистыми в год', value: t.net, bold: true, color: '#22c55e' },
      ],
    },
  ];

  const sorted = [...scenarios].sort((a, b) => a.result.totalCost - b.result.totalCost);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const saving = worst.result.totalCost - best.result.totalCost;

  return (
    <div className="space-y-5">

      {/* ── Income slider ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className="text-sm font-semibold">Желаемый доход на руки / мес</label>
          <span className="text-primary font-bold text-lg">{fmt(netMonthly)}</span>
        </div>
        <input
          type="range" min={800} max={10000} step={100}
          value={netMonthly} onChange={(e) => setNetMonthly(+e.target.value)}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
          <span>€800</span><span>€10 000</span>
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
        <span className="text-sm">Первый год živnosť (без sociálne poistenie)</span>
      </label>

      {/* ── Scenario cards ── */}
      <div className="space-y-3">
        {sorted.map((sc, i) => (
          <ScenarioCard
            key={sc.key}
            {...sc}
            isBest={i === 0}
            expanded={!!expanded[sc.key]}
            onToggle={() => toggle(sc.key)}
          />
        ))}
      </div>

      {/* ── Conclusion ── */}
      <div className="glass rounded-xl p-5 border border-primary/30 bg-primary/5">
        <p className="text-sm font-semibold leading-relaxed">
          При доходе <strong>{fmt(netMonthly)}/мес</strong> выгоднее всего{' '}
          <strong>{best.label}</strong> — экономия{' '}
          <strong className="text-green-500">{fmt(saving)} в год</strong>{' '}
          по сравнению с {worst.label}.
        </p>
      </div>

      {/* ── Disclaimer ── */}
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
        * Расчёт на основе ставок 2026 г. (ŽM {fmt(ZM)}, priem. mzda {fmt(AVG_SALARY_2024)}, min. mzda {fmt(MIN_WAGE)}).
        Здравотное SZČO {ZP_SZCO_RATE * 100}%, социальное {(SP_SZCO_RATE * 100).toFixed(2)}%, корп. налог ≤100k: {CORP_TAX_LOW_RATE * 100}%.
        Не является налоговой консультацией.
        Источники:{' '}
        <a href="https://www.podnikajte.sk/dane/dolezite-cisla-v-podnikani-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">podnikajte.sk</a>,{' '}
        <a href="https://www.socpoist.sk/socialne-poistenie/platenie-poistneho/tabulky-platenia-poistneho/tabulky-platenia-poistneho-od-1-6" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">socpoist.sk</a>.
        {' '}Для точного анализа —{' '}
        <a href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          запишись на консультацию
        </a>.
      </p>
    </div>
  );
}
