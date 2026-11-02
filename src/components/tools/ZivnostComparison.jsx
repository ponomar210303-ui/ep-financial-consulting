'use client';
import { useId, useState, useMemo } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

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

function makeFormatters(locale) {
  const tag = locale === 'en' ? 'en-GB' : 'sk-SK';
  const eur = new Intl.NumberFormat(tag, {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const percent = (n, digits = 0) => new Intl.NumberFormat(tag, {
    style: 'percent', minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(n);
  return { fmt: (n) => eur.format(Math.round(n)), pct: percent };
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
// STRINGS
// ═══════════════════════════════════════════════════════════════════════

const STRINGS = {
  sk: {
    netLabel: 'Požadovaný čistý príjem za mesiac',
    firstYear: 'Prvý rok živnosti (bez sociálneho poistenia)',
    resultsTitle: 'Porovnanie ročných odvodov a daní',
    totalCost: 'Odvody a dane za rok',
    best: 'Najvýhodnejšie',
    showDetails: 'Zobraziť detaily',
    hideDetails: 'Skryť detaily',
    help: 'Vysvetlenie',
    conclusion: (net, best, saving, worst) => (
      <>
        Pri čistom príjme <strong className="font-mono tabular-nums">{net}</strong> mesačne vychádza najlepšie{' '}
        <strong>{best}</strong>. Oproti variantu {worst} ušetríte{' '}
        <strong className="font-mono tabular-nums">{saving}</strong> ročne.
      </>
    ),
    savingLabel: 'Úspora za rok oproti najdrahšej možnosti',
    taxRange: '19 – 35 %',
    scenarios: {
      zivnost: {
        label: 'Živnosť + paušálne',
        tooltip: 'Samostatne zárobkovo činná osoba (SZČO). Paušálne výdavky 60 % sa uplatňujú bez dokladov. Najjednoduchší spôsob, ako začať.',
        required: 'Potrebné príjmy (obrat)',
        expenses: (cap) => `Paušálne výdavky (60 %, max. ${cap})`,
        health: (p) => `Zdravotné poistenie (${p})`,
        social: (p) => `Sociálne poistenie (${p})`,
        nczd: 'Nezdaniteľná časť základu dane (NČZD)',
        tax: (r) => `Daň z príjmov (${r})`,
        net: 'Čistý príjem za rok',
      },
      sro: {
        label: 's.r.o. (mzda + dividendy)',
        tooltip: 'Spoločnosť s ručením obmedzeným. Konateľ dostáva minimálnu mzdu (915 €), zvyšok sa vyplatí ako dividendy. Obmedzené ručenie.',
        required: 'Potrebný obrat spoločnosti',
        salary: (w) => `Mzda konateľa (${w} mesačne × 12)`,
        ee: 'Odvody zamestnanca',
        er: 'Odvody zamestnávateľa',
        salaryTax: 'Daň z mzdy',
        salaryNet: 'Čistá mzda konateľa',
        corp: (r) => `Daň z príjmov právnickej osoby (${r})`,
        div: (p) => `Daň z dividend (${p})`,
        netDiv: 'Čisté dividendy',
        net: 'Spolu na ruku',
      },
      tpp: {
        label: 'TPP (zamestnanie)',
        tooltip: 'Pracovná zmluva. Odvody platí zamestnávateľ aj zamestnanec. Najjednoduchšia možnosť, ale pre zamestnávateľa najdrahšia.',
        required: 'Potrebná hrubá mzda za rok',
        ee: (p) => `Odvody zamestnanca (${p})`,
        er: (p) => `Odvody zamestnávateľa (${p})`,
        tax: 'Daň z príjmov',
        employerCost: 'Celkové náklady zamestnávateľa',
        net: 'Čistý príjem za rok',
      },
    },
    basis: (zm, avg, min, zp, sp, corp) =>
      `Výpočet vychádza zo sadzieb pre rok 2026 (životné minimum ${zm}, priemerná mzda ${avg}, minimálna mzda ${min}). Zdravotné poistenie SZČO ${zp}, sociálne poistenie ${sp}, daň z príjmov právnických osôb do 100 000 €: ${corp}.`,
    sources: 'Zdroje:',
    disclaimer: 'Výpočet je orientačný a nenahrádza daňové poradenstvo.',
  },
  en: {
    netLabel: 'Desired net income per month',
    firstYear: 'First year of živnosť (no social insurance)',
    resultsTitle: 'Comparison of annual contributions and taxes',
    totalCost: 'Contributions and taxes per year',
    best: 'Lowest cost',
    showDetails: 'Show details',
    hideDetails: 'Hide details',
    help: 'Explanation',
    conclusion: (net, best, saving, worst) => (
      <>
        For a net income of <strong className="font-mono tabular-nums">{net}</strong> per month, the best option is{' '}
        <strong>{best}</strong>. Compared with {worst}, you save{' '}
        <strong className="font-mono tabular-nums">{saving}</strong> per year.
      </>
    ),
    savingLabel: 'Yearly saving vs. the most expensive option',
    taxRange: '19–35%',
    scenarios: {
      zivnost: {
        label: 'Živnosť + flat-rate expenses',
        tooltip: 'Self-employed (SZČO) under a trade licence. The 60% flat-rate expense deduction needs no receipts. The simplest way to start.',
        required: 'Required revenue (príjmy)',
        expenses: (cap) => `Flat-rate expenses (60%, max. ${cap})`,
        health: (p) => `Health insurance, Zdravotná poisťovňa (${p})`,
        social: (p) => `Social insurance, Sociálna poisťovňa (${p})`,
        nczd: 'Non-taxable part of the tax base (NČZD)',
        tax: (r) => `Income tax (${r})`,
        net: 'Net income per year',
      },
      sro: {
        label: 's.r.o. (salary + dividends)',
        tooltip: 'Limited liability company. The director draws the minimum wage (€915) and the rest is paid out as dividends. Liability is limited.',
        required: 'Required company revenue',
        salary: (w) => `Director salary (${w} per month × 12)`,
        ee: 'Employee contributions (odvody)',
        er: 'Employer contributions (odvody)',
        salaryTax: 'Tax on salary',
        salaryNet: 'Director net salary',
        corp: (r) => `Corporate income tax (${r})`,
        div: (p) => `Dividend tax (${p})`,
        netDiv: 'Net dividends',
        net: 'Total take-home',
      },
      tpp: {
        label: 'TPP (employment)',
        tooltip: 'Employment contract (TPP). Both employer and employee pay contributions. The simplest option, but the most expensive for the employer.',
        required: 'Required gross salary per year',
        ee: (p) => `Employee contributions (${p})`,
        er: (p) => `Employer contributions (${p})`,
        tax: 'Income tax',
        employerCost: 'Total employer cost',
        net: 'Net income per year',
      },
    },
    basis: (zm, avg, min, zp, sp, corp) =>
      `Based on 2026 rates (subsistence minimum ${zm}, average wage ${avg}, minimum wage ${min}). SZČO health insurance ${zp}, social insurance ${sp}, corporate income tax up to €100,000: ${corp}.`,
    sources: 'Sources:',
    disclaimer: 'This is an estimate, not tax advice.',
  },
  ru: {
    netLabel: 'Желаемый доход на руки / мес',
    firstYear: 'Первый год živnosť (без sociálne poistenie)',
    resultsTitle: 'Сравнение годовых отчислений',
    totalCost: 'Отчисления в год',
    best: 'Выгоднее всего',
    showDetails: 'Показать детали',
    hideDetails: 'Скрыть детали',
    help: 'Подсказка',
    conclusion: (net, best, saving, worst) => (
      <>
        При доходе <strong>{net}/мес</strong> выгоднее всего{' '}
        <strong>{best}</strong> — экономия{' '}
        <strong>{saving} в год</strong>{' '}
        по сравнению с {worst}.
      </>
    ),
    savingLabel: 'Экономия в год',
    taxRange: '19–35%',
    scenarios: {
      zivnost: {
        label: 'Živnosť + paušálne',
        tooltip: 'Самозанятость (ИП). Паушальные расходы 60% — не нужно собирать чеки. Проще всего начать.',
        required: 'Нужный оборот (príjmy)',
        expenses: (cap) => `Паушальные расходы (60%, макс. ${cap})`,
        health: (p) => `Здравотное (${p})`,
        social: (p) => `Социальное (${p})`,
        nczd: 'НЧЗД',
        tax: (r) => `Налог (${r})`,
        net: 'Чистыми в год',
      },
      sro: {
        label: 's.r.o. (ЗП + дивиденды)',
        tooltip: 'ООО. Директор получает мин. зарплату (€915), остальное — дивиденды. Ограниченная ответственность.',
        required: 'Нужный оборот компании',
        salary: (w) => `ЗП директора (${w}/мес × 12)`,
        ee: 'Odvody работника',
        er: 'Odvody работодателя',
        salaryTax: 'Налог на ЗП',
        salaryNet: 'Чистая ЗП директора',
        corp: (r) => `Корп. налог (${r})`,
        div: (p) => `Налог на дивиденды (${p})`,
        netDiv: 'Чистые дивиденды',
        net: 'Итого на руки',
      },
      tpp: {
        label: 'TPP (работа по найму)',
        tooltip: 'Трудовой договор. Работодатель платит все odvody. Самый простой вариант — но и самый дорогой для работодателя.',
        required: 'Нужная gross ЗП',
        ee: (p) => `Odvody работника (${p})`,
        er: (p) => `Odvody работодателя (${p})`,
        tax: 'Налог на доход',
        employerCost: 'Полная стоимость для работодателя',
        net: 'Чистыми в год',
      },
    },
    basis: (zm, avg, min, zp, sp, corp) =>
      `* Расчёт на основе ставок 2026 г. (ŽM ${zm}, priem. mzda ${avg}, min. mzda ${min}). Здравотное SZČO ${zp}, социальное ${sp}, корп. налог ≤100k: ${corp}.`,
    sources: 'Источники:',
    disclaimer: 'Не является налоговой консультацией.',
    // Old CTA text, kept for reference only (not rendered).
    oldCta: 'Для точного анализа — запишись на консультацию',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function TooltipIcon({ text, label }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-muted-foreground hover:text-foreground transition-colors align-middle"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-56 max-w-[calc(100vw-3rem)] p-3 rounded-lg border border-border bg-background shadow-sm text-xs font-normal text-muted-foreground leading-relaxed">
            {text}
          </div>
        </>
      )}
    </span>
  );
}

function DetailRow({ label, value, bold, accent, muted, fmt }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-1.5 ${bold ? 'font-semibold' : ''}`}>
      <span className={`text-xs ${muted ? 'text-muted-foreground italic' : bold ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      <span
        className={`font-mono text-xs tabular-nums whitespace-nowrap ${bold ? 'font-semibold' : ''} ${muted ? 'text-muted-foreground italic' : ''} ${accent ? 'text-primary' : ''}`}
      >
        {value < 0 ? '−' : ''}{fmt(Math.abs(value))}
      </span>
    </div>
  );
}

function ScenarioCard({ id, label, tooltip, result, swatch, isBest, expanded, onToggle, detailRows, t, fmt }) {
  const detailsId = `${id}-details`;
  return (
    <div className={`rounded-xl border bg-background overflow-hidden ${isBest ? 'border-primary' : 'border-border'}`}>
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: swatch }} />
            <span className="font-semibold text-sm">{label}</span>
            <TooltipIcon text={tooltip} label={t.help} />
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 pl-[18px]">{t.totalCost}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono tabular-nums font-semibold text-lg">{fmt(result.totalCost)}</div>
          {isBest && (
            <div className="mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full text-primary bg-primary/10">
              {t.best}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="w-full flex items-center justify-center gap-1 h-9 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <span>{expanded ? t.hideDetails : t.showDetails}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div id={detailsId} className="px-4 pb-3 pt-2 border-t border-border space-y-0.5">
          {detailRows.map((row, i) => (
            <DetailRow key={i} {...row} fmt={fmt} />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function ZivnostComparison({ locale = 'sk' }) {
  const t = STRINGS[locale] ?? STRINGS.sk;
  const { fmt, pct } = makeFormatters(locale);
  const netId = useId();
  const firstYearId = useId();

  const [netMonthly, setNetMonthly] = useState(2000);
  const [firstYear, setFirstYear] = useState(false);
  const [expanded, setExpanded] = useState({});

  const z = useMemo(() => calculateZivnost(netMonthly, firstYear), [netMonthly, firstYear]);
  const s = useMemo(() => calculateSro(netMonthly), [netMonthly]);
  const tp = useMemo(() => calculateTpp(netMonthly), [netMonthly]);

  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const scenarios = [
    {
      key: 'zivnost',
      label: t.scenarios.zivnost.label,
      tooltip: t.scenarios.zivnost.tooltip,
      result: z,
      swatch: 'hsl(var(--chart-1))',
      detailRows: [
        { label: t.scenarios.zivnost.required, value: z.gross, bold: true },
        { label: t.scenarios.zivnost.expenses(fmt(PAUSALNE_CAP)), value: -z.expenses },
        { label: t.scenarios.zivnost.health(pct(ZP_SZCO_RATE, 0)), value: -z.zdravotna },
        { label: t.scenarios.zivnost.social(pct(SP_SZCO_RATE, 2)), value: -z.socialna, muted: z.socialna === 0 },
        { label: t.scenarios.zivnost.nczd, value: z.nczd, muted: true },
        { label: t.scenarios.zivnost.tax(z.gross <= SMALL_BIZ_LIMIT ? pct(SMALL_BIZ_RATE, 0) : t.taxRange), value: -z.tax },
        { label: t.scenarios.zivnost.net, value: z.net, bold: true, accent: true },
      ],
    },
    {
      key: 'sro',
      label: t.scenarios.sro.label,
      tooltip: t.scenarios.sro.tooltip,
      result: s,
      swatch: 'hsl(var(--chart-2))',
      detailRows: [
        { label: t.scenarios.sro.required, value: s.gross, bold: true },
        { label: t.scenarios.sro.salary(fmt(MIN_WAGE)), value: s.salaryGross },
        { label: t.scenarios.sro.ee, value: -s.eeContrib },
        { label: t.scenarios.sro.er, value: -s.erContrib },
        { label: t.scenarios.sro.salaryTax, value: -s.salaryTax },
        { label: t.scenarios.sro.salaryNet, value: s.salaryNet, muted: true },
        { label: t.scenarios.sro.corp(pct(s.corpTaxRate, 0)), value: -s.corpTax },
        { label: t.scenarios.sro.div(pct(DIVIDEND_TAX, 0)), value: -s.divTax },
        { label: t.scenarios.sro.netDiv, value: s.netDividends, muted: true },
        { label: t.scenarios.sro.net, value: s.net, bold: true, accent: true },
      ],
    },
    {
      key: 'tpp',
      label: t.scenarios.tpp.label,
      tooltip: t.scenarios.tpp.tooltip,
      result: tp,
      swatch: 'hsl(var(--chart-4))',
      detailRows: [
        { label: t.scenarios.tpp.required, value: tp.gross, bold: true },
        { label: t.scenarios.tpp.ee(pct(EE_TOTAL, 1)), value: -tp.eeContrib },
        { label: t.scenarios.tpp.er(pct(ER_TOTAL, 1)), value: -tp.erContrib },
        { label: t.scenarios.tpp.tax, value: -tp.tax },
        { label: t.scenarios.tpp.employerCost, value: tp.employerCost, muted: true },
        { label: t.scenarios.tpp.net, value: tp.net, bold: true, accent: true },
      ],
    },
  ];

  const sorted = [...scenarios].sort((a, b) => a.result.totalCost - b.result.totalCost);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const saving = worst.result.totalCost - best.result.totalCost;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
        {/* ───────── Inputs ───────── */}
        <section className="rounded-xl border border-border bg-background p-5 sm:p-6 space-y-5">
          <div>
            <label htmlFor={netId} className="text-sm font-medium">{t.netLabel}</label>
            <div className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold mt-1 mb-3">{fmt(netMonthly)}</div>
            <input
              id={netId}
              type="range" min={800} max={10000} step={100}
              value={netMonthly} onChange={(e) => setNetMonthly(+e.target.value)}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-0.5 font-mono tabular-nums">
              <span>{fmt(800)}</span><span>{fmt(10000)}</span>
            </div>
          </div>

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
        <section className="rounded-xl border border-border bg-muted p-5 sm:p-6 space-y-5">
          <div>
            <div className="text-sm text-muted-foreground">{t.savingLabel}</div>
            <div className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold mt-1">{fmt(saving)}</div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              {t.conclusion(fmt(netMonthly), best.label, fmt(saving), worst.label)}
            </p>
          </div>

          <h3 className="font-display text-sm font-semibold">{t.resultsTitle}</h3>
          <div className="space-y-3">
            {sorted.map((sc, i) => (
              <ScenarioCard
                key={sc.key}
                id={`${netId}-${sc.key}`}
                label={sc.label}
                tooltip={sc.tooltip}
                result={sc.result}
                swatch={sc.swatch}
                detailRows={sc.detailRows}
                isBest={i === 0}
                expanded={!!expanded[sc.key]}
                onToggle={() => toggle(sc.key)}
                t={t}
                fmt={fmt}
              />
            ))}
          </div>
        </section>
      </div>

      {/* ── Basis + disclaimer ── */}
      <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
        <p>
          {t.basis(
            fmt(ZM),
            fmt(AVG_SALARY_2024),
            fmt(MIN_WAGE),
            pct(ZP_SZCO_RATE, 0),
            pct(SP_SZCO_RATE, 2),
            pct(CORP_TAX_LOW_RATE, 0),
          )}{' '}
          {t.sources}{' '}
          <a href="https://www.podnikajte.sk/dane/dolezite-cisla-v-podnikani-2026" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">podnikajte.sk</a>,{' '}
          <a href="https://www.socpoist.sk/socialne-poistenie/platenie-poistneho/tabulky-platenia-poistneho/tabulky-platenia-poistneho-od-1-6" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">socpoist.sk</a>.
        </p>
        <p>{t.disclaimer}</p>
      </div>
    </div>
  );
}
