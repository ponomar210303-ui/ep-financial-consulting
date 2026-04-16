'use client';
import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { CONSULTATION_URL } from '../../config/tools';

// ═══════════════════════════════════════════════════════════════════════
// 2026 PENALTY CONSTANTS
// Sources: zákon 563/2009 (daňový poriadok), zákon 222/2004 (DPH),
//          zákon 461/2003 (sociálne poistenie), zákon 580/2004 (zdravotné),
//          zákon 82/2005 (nelegálna práca), zákon 384/2025 (eKasa)
// ECB main refinancing rate: 2.15% (platné od 11.6.2025)
// Dátum overenia: apríl 2026
// ═══════════════════════════════════════════════════════════════════════

const C = {
  // ECB & úroky
  ECB_RATE: 0.0215,            // ECB hlavná refinančná sadzba
  TAX_PENALTY_RATE: 0.15,      // 4×ECB, min 15% → 15% (§156 daň. poriadku)
  HEALTH_PENALTY_RATE: 0.15,   // 4×ECB, min 15% → 15% (§18 z.č. 580/2004)
  SOCIAL_PENALTY_DAILY: 0.0005, // 0.05%/deň = 18.25% p.a. (§240 z.č. 461/2003)

  // Penále za doručenie (§155 daň. poriadku)
  PENALE_NO_DISCLOSURE: 0.10,   // 3×ECB, min 10%
  PENALE_BEFORE_AUDIT: 0.03,    // 1×ECB, min 3%
  PENALE_AFTER_AUDIT: 0.07,     // 2×ECB, min 7%

  // Pokuty za daňové priznanie (§154, od 1.1.2026)
  DP_FINE_MIN: 100,
  DP_FINE_MAX: 30000,

  // DPH prahové hodnoty (od 1.1.2025)
  DPH_THRESHOLD: 50000,        // povinná registrácia za kalendárny rok
  DPH_IMMEDIATE: 62500,        // okamžitá registrácia
  DPH_REG_FINE_MIN: 100,       // §154, od 2026
  DPH_REG_FINE_MAX: 30000,
  DPH_RATE: 0.23,              // základná sadzba DPH 2026

  // Sociálna poisťovňa — pokuty (§239)
  SP_VYKAZ_FINE_MIN: 5,
  SP_VYKAZ_FINE_MAX: 1330,
  SP_FINE_ABSOLUTE_MAX: 16597,

  // Zdravotná — pokuty (§26 z.č. 580/2004)
  ZP_INSURED_FINE_MAX: 165,
  ZP_NOTIFICATION_FINE_MAX: 331,
  ZP_PAYER_FINE_MAX: 3319,

  // Nelegálna práca (z.č. 82/2005, z.č. 125/2006 §19 ods. 2, od 2026)
  NP_WORKER_FINE_MAX: 331,
  NP_EMPLOYER_FINE_MIN: 4000,
  NP_EMPLOYER_FINE_MAX: 200000,
  NP_EMPLOYER_FINE_MIN_2PLUS: 8000,

  // eKasa (z.č. 384/2025, od 1.1.2026)
  EKASA_FIRST_MIN: 1500,
  EKASA_FIRST_MAX: 20000,
  EKASA_REPEAT_MIN: 3000,
  EKASA_REPEAT_MAX: 40000,
  EKASA_SERIOUS_MAX: 60000,
};

// ═══════════════════════════════════════════════════════════════════════
// CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function calculateDpDelayPenalty(taxAmount, monthsLate, hasExtension) {
  const effectiveMonths = hasExtension ? Math.max(0, monthsLate - 3) : monthsLate;

  // Штраф за неподачу: от €100, зависит от решения инспектора
  // Формула: чем больше сумма и срок, тем ближе к максимуму
  const fineRatio = Math.min(1, (effectiveMonths / 24) * 0.5 + (taxAmount / 50000) * 0.5);
  const filing = effectiveMonths <= 0
    ? 0
    : Math.max(C.DP_FINE_MIN, Math.round(fineRatio * C.DP_FINE_MAX));

  // Penále за доначисление: 10% годовых, считается подённо
  const days = effectiveMonths * 30;
  const penale = days <= 0 ? 0 : Math.max(5, Math.round(taxAmount * C.PENALE_NO_DISCLOSURE * days / 365));
  const penaleCapped = Math.min(penale, taxAmount); // max 100% суммы налога

  return { filing, penale: penaleCapped, total: filing + penaleCapped, effectiveMonths, days };
}

function calculateDphRegistrationPenalty(revenueOverThreshold, monthsLate) {
  // Доначисление DPH: со всех доходов сверх порога за период опоздания
  const dphBackAssessment = monthsLate > 1
    ? Math.round(revenueOverThreshold * C.DPH_RATE * (monthsLate / 12))
    : 0;

  // Штраф за несвоевременную регистрацию
  const fineRatio = Math.min(1, monthsLate / 12);
  const regFine = Math.max(C.DPH_REG_FINE_MIN, Math.round(fineRatio * 5000));

  // Penále на доначисленную DPH (15% годовых)
  const days = monthsLate * 30;
  const penale = dphBackAssessment > 0
    ? Math.round(dphBackAssessment * C.TAX_PENALTY_RATE * days / 365)
    : 0;

  return { dphBackAssessment, regFine, penale, total: dphBackAssessment + regFine + penale };
}

function calculateLatePaymentPenalty(taxAmount, daysLate) {
  // §156: úrok = suma × sadzba × dni / 365, min 15% p.a.
  const interest = Math.round(taxAmount * C.TAX_PENALTY_RATE * daysLate / 365 * 100) / 100;
  const rounded = interest < 5 ? 0 : Math.floor(interest * 10) / 10;
  return { interest: rounded, totalWithTax: Math.round(taxAmount + rounded) };
}

function calculateSocialPenalty(debtAmount, monthsLate) {
  // §240: 0.05% в день, max 100% долга
  const days = monthsLate * 30;
  const penale = Math.round(debtAmount * C.SOCIAL_PENALTY_DAILY * days);
  const penaleCapped = Math.min(penale, debtAmount);

  // Штраф за неподачу výkazu — за каждый пропущенный месяц
  const vykazFine = monthsLate * Math.min(C.SP_VYKAZ_FINE_MIN * monthsLate, C.SP_VYKAZ_FINE_MAX);
  const vykazCapped = Math.min(vykazFine, C.SP_FINE_ABSOLUTE_MAX);

  return { penale: penaleCapped, vykazFine: vykazCapped, total: penaleCapped + vykazCapped, days };
}

function calculateHealthPenalty(debtAmount, monthsLate) {
  // §18: úrok = (dlh × dni × sadzba) / 36500, min 15% p.a.
  const days = monthsLate * 30;
  const interest = Math.round(debtAmount * days * C.HEALTH_PENALTY_RATE / 365 * 100) / 100;
  const interestRounded = interest < 5 ? 0 : interest;

  // Штраф за неподачу oznámení (до €3319)
  const notifFine = Math.min(monthsLate * 50, C.ZP_PAYER_FINE_MAX);

  return { interest: interestRounded, notifFine, total: Math.round(interestRounded + notifFine), days };
}

function calculateBlackWorkPenalty(income, monthsWorked, isEmployer) {
  if (isEmployer) {
    // Штраф для заказчика: €4000—€200000
    const fine = Math.max(C.NP_EMPLOYER_FINE_MIN, Math.min(C.NP_EMPLOYER_FINE_MAX,
      Math.round(C.NP_EMPLOYER_FINE_MIN + (income / 100000) * 50000 + monthsWorked * 2000)));
    return { fineMin: C.NP_EMPLOYER_FINE_MIN, fineMax: fine, taxBackpay: 0, socialBackpay: 0, total: fine };
  }

  // Штраф для работника: до €331
  const workerFine = Math.min(C.NP_WORKER_FINE_MAX, 100 + monthsWorked * 20);

  // Доначисление налога (~19% с дохода)
  const taxBackpay = Math.round(income * 0.19);

  // Доначисление взносов (~34% — социальные + здравотные)
  const socialBackpay = Math.round(income * 0.34);

  // Penále на доначисленные суммы
  const penale = Math.round((taxBackpay + socialBackpay) * C.TAX_PENALTY_RATE * (monthsWorked / 12));

  return {
    workerFine,
    taxBackpay,
    socialBackpay,
    penale,
    totalMin: workerFine + taxBackpay + socialBackpay,
    totalMax: workerFine + taxBackpay + socialBackpay + penale,
  };
}

function calculateEkasaPenalty(noEkasa, noReceipts, isFirstOffense, hiddenRevenue) {
  let fineMin = 0;
  let fineMax = 0;

  if (noEkasa) {
    fineMin += isFirstOffense ? C.EKASA_FIRST_MIN : C.EKASA_REPEAT_MIN;
    fineMax += isFirstOffense ? C.EKASA_FIRST_MAX : C.EKASA_REPEAT_MAX;
  }

  if (noReceipts) {
    fineMin += isFirstOffense ? C.EKASA_FIRST_MIN : C.EKASA_REPEAT_MIN;
    fineMax += isFirstOffense ? C.EKASA_FIRST_MAX : C.EKASA_REPEAT_MAX;
  }

  // Доначисление налога с укрытых тržieb
  const taxOnHidden = hiddenRevenue > 0 ? Math.round(hiddenRevenue * 0.19) : 0;
  const dphOnHidden = hiddenRevenue > 0 ? Math.round(hiddenRevenue * C.DPH_RATE) : 0;

  // Cap at serious max
  fineMax = Math.min(fineMax, C.EKASA_SERIOUS_MAX);

  return {
    fineMin,
    fineMax,
    taxOnHidden,
    dphOnHidden,
    totalMin: fineMin + taxOnHidden,
    totalMax: fineMax + taxOnHidden + dphOnHidden,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n)) + ' €';
}

function severityColor(amount) {
  if (amount < 100) return 'text-blue-400';
  if (amount <= 500) return 'text-amber-400';
  return 'text-red-400';
}

function severityBorder(amount) {
  if (amount < 100) return 'border-blue-500/30';
  if (amount <= 500) return 'border-amber-500/30';
  return 'border-red-500/30';
}

function severityBg(amount) {
  if (amount < 100) return 'bg-blue-500/5';
  if (amount <= 500) return 'bg-amber-500/5';
  return 'bg-red-500/5';
}

function advice(amount) {
  if (amount < 100) return { text: 'Не паникуй. Исправь как можно скорее — штраф минимальный.', color: 'text-blue-400' };
  if (amount <= 500) return { text: 'Стоит исправить срочно — каждый день/месяц штраф растёт.', color: 'text-amber-400' };
  return { text: 'Серьёзная сумма — лучше сразу проконсультируйся, возможно есть способ минимизировать.', color: 'text-red-400' };
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function NumberInput({ value, onChange, label, suffix = '€', min = 0, max = 999999, step = 100 }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, +e.target.value || 0)))}
          className="w-full h-9 px-3 rounded-lg bg-card border border-border/50 text-sm focus:outline-none focus:border-primary/50"
          min={min}
          max={max}
          step={step}
        />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}

function SliderInput({ value, onChange, label, min = 1, max = 24, suffix = '' }) {
  return (
    <div>
      <div className="flex justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs font-bold text-foreground">{value} {suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full mt-1 accent-amber-500"
      />
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-border'}`}
      >
        {checked && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="text-xs text-muted-foreground leading-tight">{label}</span>
    </label>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => onChange(opt.value)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${value === opt.value ? 'border-primary' : 'border-border'}`}
          >
            {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
          </div>
          <span className="text-xs text-muted-foreground">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function ResultBlock({ children, amount }) {
  const sev = advice(amount);
  return (
    <div className={`rounded-xl p-4 border-l-4 ${severityBorder(amount)} ${severityBg(amount)} space-y-3`}>
      {children}
      <p className={`text-xs font-medium ${sev.color}`}>{sev.text}</p>
    </div>
  );
}

function DetailsToggle({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen(!open)} className="text-xs text-primary/70 hover:text-primary flex items-center gap-1">
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        {title}
      </button>
      {open && <div className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed space-y-1 pl-4 border-l border-border/30">{children}</div>}
    </div>
  );
}

function ResultRow({ label, value, bold }) {
  return (
    <div className={`flex justify-between ${bold ? 'pt-2 border-t border-border/30' : ''}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-semibold ${bold ? 'text-lg font-black' : ''}`}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIOLATION CARDS
// ═══════════════════════════════════════════════════════════════════════

function Card1() {
  const [tax, setTax] = useState(1000);
  const [months, setMonths] = useState(3);
  const [extended, setExtended] = useState(false);

  const r = calculateDpDelayPenalty(tax, months, extended);
  const totalAmount = r.total;

  return (
    <div className="space-y-4">
      <NumberInput label="Сумма налога к доплате" value={tax} onChange={setTax} max={100000} step={500} />
      <SliderInput label="Месяцев просрочки" value={months} onChange={setMonths} min={1} max={24} suffix="мес." />
      <Checkbox checked={extended} onChange={setExtended} label="Я подал уведомление о продлении до 30 июня (oznámenie o predĺžení)" />

      {r.effectiveMonths <= 0 ? (
        <div className="rounded-xl p-4 bg-green-500/5 border-l-4 border-green-500/30">
          <p className="text-sm font-semibold text-green-400">Ты в пределах продлённого срока — штрафа нет!</p>
          <p className="text-xs text-muted-foreground mt-1">Главное — подай декларацию до 30 июня.</p>
        </div>
      ) : (
        <ResultBlock amount={totalAmount}>
          <ResultRow label="Штраф за неподачу декларации (§154)" value={fmt(r.filing)} />
          <ResultRow label={`Penále за доначисление (10% годовых × ${r.days} дней)`} value={fmt(r.penale)} />
          <ResultRow label="Итого" value={<span className={severityColor(totalAmount)}>{fmt(totalAmount)}</span>} bold />
        </ResultBlock>
      )}

      <DetailsToggle title="Как считается">
        <p><strong>Штраф за неподачу (§154 daň. poriadku):</strong> от €100 до €30 000. Зависит от суммы налога, срока просрочки и решения инспектора.</p>
        <p><strong>Penále (§155):</strong> 3× ставка ECB (мин. 10%) годовых от суммы налога, считается подённо. Макс. 100% суммы налога.</p>
        <p><strong>Правило «второго шанса»:</strong> первое нарушение может быть прощено (с 2024).</p>
        <p><strong>Скидка 1/3 (с 2026):</strong> при оплате в течение 15 дней.</p>
        {extended && <p><strong>Продление:</strong> при подаче oznámenia до 31 марта срок переносится на 30 июня. Первые 3 месяца не считаются просрочкой.</p>}
      </DetailsToggle>
    </div>
  );
}

function Card2() {
  const [revenue, setRevenue] = useState(10000);
  const [months, setMonths] = useState(3);

  const r = calculateDphRegistrationPenalty(revenue, months);

  return (
    <div className="space-y-4">
      <NumberInput label="Оборот сверх порога (€50 000)" value={revenue} onChange={setRevenue} max={500000} step={1000} />
      <SliderInput label="Месяцев после превышения" value={months} onChange={setMonths} min={1} max={12} suffix="мес." />

      <ResultBlock amount={r.total}>
        <ResultRow label="Доначисление DPH (23%)" value={fmt(r.dphBackAssessment)} />
        <ResultRow label="Штраф за просрочку регистрации (§154)" value={fmt(r.regFine)} />
        <ResultRow label="Penále на доначисленную DPH (15% год.)" value={fmt(r.penale)} />
        <ResultRow label="Итого" value={<span className={severityColor(r.total)}>{fmt(r.total)}</span>} bold />
      </ResultBlock>

      <DetailsToggle title="Как считается">
        <p><strong>Порог (с 2025):</strong> €50 000 за календарный год → подать заявление в течение 5 рабочих дней.</p>
        <p><strong>Срочный порог:</strong> €62 500 → немедленная регистрация в день превышения.</p>
        <p><strong>Опоздание &gt;30 дней:</strong> подать чрезвычайную декларацию DPH за весь период с 31-го дня.</p>
        <p><strong>Штраф (§154, с 2026):</strong> от €100 до €30 000.</p>
        <p>Источник: zákon č. 222/2004 Z.z. о DPH, §4, §55, §78</p>
      </DetailsToggle>
    </div>
  );
}

function Card3() {
  const [tax, setTax] = useState(3000);
  const [days, setDays] = useState(30);

  const r = calculateLatePaymentPenalty(tax, days);

  return (
    <div className="space-y-4">
      <NumberInput label="Сумма неуплаченного налога" value={tax} onChange={setTax} max={100000} step={500} />
      <SliderInput label="Дней просрочки" value={days} onChange={setDays} min={1} max={365} suffix="дн." />

      <ResultBlock amount={r.interest}>
        <ResultRow label={`Penále (${tax} × 15% × ${days} / 365)`} value={fmt(r.interest)} />
        <ResultRow label="Итого к оплате (налог + penále)" value={<span className={severityColor(r.interest)}>{fmt(r.totalWithTax)}</span>} bold />
      </ResultBlock>

      <DetailsToggle title="Как считается">
        <p><strong>Формула (§156):</strong> сумма × ставка × дней / 365</p>
        <p><strong>Ставка:</strong> 4× ECB (2.15%) = 8.6%, но минимум 15% → применяется <strong>15% годовых</strong></p>
        <p><strong>Минимум:</strong> не начисляется если úrok &lt; €5</p>
        <p><strong>Пример:</strong> €6 000 × 15% × 22 дня / 365 = €54,20</p>
      </DetailsToggle>
    </div>
  );
}

function Card4() {
  const [debt, setDebt] = useState(500);
  const [months, setMonths] = useState(3);

  const r = calculateSocialPenalty(debt, months);

  return (
    <div className="space-y-4">
      <NumberInput label="Сумма неуплаченных взносов" value={debt} onChange={setDebt} max={50000} step={100} />
      <SliderInput label="Месяцев просрочки" value={months} onChange={setMonths} min={1} max={24} suffix="мес." />

      <ResultBlock amount={r.total}>
        <ResultRow label={`Penále (0.05%/день × ${r.days} дн.)`} value={fmt(r.penale)} />
        <ResultRow label="Штраф за неподачу výkazu" value={fmt(r.vykazFine)} />
        <ResultRow label="Итого" value={<span className={severityColor(r.total)}>{fmt(r.total)}</span>} bold />
      </ResultBlock>

      <DetailsToggle title="Как считается">
        <p><strong>Penále (§240):</strong> 0.05% в день от суммы долга (= 18.25% годовых). Не более 100% долга.</p>
        <p><strong>Не начисляется</strong> если penále &lt; €5.</p>
        <p><strong>Штраф за výkaz (§239):</strong> от €5 до €1 330 за каждый пропущенный отчёт.</p>
        <p><strong>Правило 7 дней:</strong> если подашь в течение 7 дней после срока — штраф не налагается.</p>
        <p><strong>Splátkový kalendár:</strong> Sociálna poisťovňa часто идёт на рассрочку — обратись к ним.</p>
      </DetailsToggle>
    </div>
  );
}

function Card5() {
  const [debt, setDebt] = useState(300);
  const [months, setMonths] = useState(3);

  const r = calculateHealthPenalty(debt, months);

  return (
    <div className="space-y-4">
      <NumberInput label="Сумма неуплаченных взносов" value={debt} onChange={setDebt} max={50000} step={100} />
      <SliderInput label="Месяцев просрочки" value={months} onChange={setMonths} min={1} max={24} suffix="мес." />

      <ResultBlock amount={r.total}>
        <ResultRow label={`Úrok z omeškania (15% год. × ${r.days} дн.)`} value={fmt(r.interest)} />
        <ResultRow label="Штраф за неподачу oznámenia (ÚDZS)" value={fmt(r.notifFine)} />
        <ResultRow label="Итого" value={<span className={severityColor(r.total)}>{fmt(r.total)}</span>} bold />
      </ResultBlock>

      <DetailsToggle title="Как считается">
        <p><strong>Úrok (§18 z.č. 580/2004):</strong> (долг × дни × 15%) / 36 500. Ставка: 4× ECB, мин. 15%.</p>
        <p><strong>Pokuty (§26):</strong> налагает ÚDZS (не страховая). До €165 (застрахованный), до €3 319 (плательщик).</p>
        <p><strong>Повторное нарушение:</strong> штраф удваивается в течение 2 лет.</p>
      </DetailsToggle>
    </div>
  );
}

function Card6() {
  const [role, setRole] = useState('worker');
  const [income, setIncome] = useState(5000);
  const [months, setMonths] = useState(6);

  const r = calculateBlackWorkPenalty(income, months, role === 'employer');
  const mainAmount = role === 'employer' ? r.fineMax : r.totalMax;

  return (
    <div className="space-y-4">
      <RadioGroup
        value={role}
        onChange={setRole}
        options={[
          { value: 'worker', label: 'Я работаю без оформленной živnosti' },
          { value: 'employer', label: 'Я нанял человека без оформления' },
        ]}
      />
      <NumberInput label="Примерный доход за период" value={income} onChange={setIncome} max={200000} step={500} />
      <SliderInput label="Месяцев работы без оформления" value={months} onChange={setMonths} min={1} max={24} suffix="мес." />

      <ResultBlock amount={mainAmount}>
        {role === 'worker' ? (
          <>
            <ResultRow label="Штраф за nelegálnu prácu (priestupok)" value={fmt(r.workerFine)} />
            <ResultRow label="Доначисление налога (~19%)" value={fmt(r.taxBackpay)} />
            <ResultRow label="Доначисление взносов (~34%)" value={fmt(r.socialBackpay)} />
            <ResultRow label="Penále на доначисления" value={fmt(r.penale)} />
            <ResultRow label="Итого" value={<span className={severityColor(r.totalMax)}>{fmt(r.totalMin)} — {fmt(r.totalMax)}</span>} bold />
          </>
        ) : (
          <>
            <ResultRow label="Штраф для заказчика (§19 z.č. 125/2006)" value={`${fmt(C.NP_EMPLOYER_FINE_MIN)} — ${fmt(r.fineMax)}`} />
            <ResultRow label="Плюс доначисление всех взносов задним числом" value="индивидуально" />
            <ResultRow label="Ориентировочный штраф" value={<span className="text-red-400">{fmt(r.fineMax)}</span>} bold />
          </>
        )}
      </ResultBlock>

      <DetailsToggle title="Как обычно вскрывается">
        <p><strong>Проверки Inšpektorátu práce:</strong> неанонсированные визиты, контрольные закупки.</p>
        <p><strong>Жалобы:</strong> бывшие клиенты, конкуренты, соседи.</p>
        <p><strong>Банковские транзакции:</strong> регулярные переводы без договора = подозрение.</p>
        <p><strong>Кросс-проверки:</strong> Sociálna poisťovňa × Finančná správa — если доход есть, а взносы не платятся.</p>
        <p><strong>С 2026:</strong> определение зависимой работы упрощено — доказать «шварц-систем» стало легче.</p>
      </DetailsToggle>

      <DetailsToggle title="Дополнительные последствия">
        <p><strong>Реестр:</strong> 5 лет в публичном реестре нелегальных работодателей (ip.gov.sk)</p>
        <p><strong>Госзакупки:</strong> исключение на 3 года</p>
        <p><strong>Субсидии ЕС:</strong> недоступны 3 года</p>
        <p><strong>Уголовная ответственность (§276 Trestného zákona):</strong> от 1 до 12 лет при значительных суммах</p>
      </DetailsToggle>

      <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/20">
        <p className="text-xs text-red-300 leading-relaxed">
          <strong>Это самое опасное нарушение.</strong> Чем раньше легализуешься — тем меньше доначислят.
          Открыть živnosť — 4 дня и €5 пошлины. Если уже работаешь несколько месяцев —{' '}
          <a href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="underline text-red-200 hover:text-white">давай обсудим, как минимизировать риски</a>.
        </p>
      </div>
    </div>
  );
}

function Card7() {
  const [noEkasa, setNoEkasa] = useState(true);
  const [noReceipts, setNoReceipts] = useState(false);
  const [firstOffense, setFirstOffense] = useState(true);
  const [hidden, setHidden] = useState(0);

  const r = calculateEkasaPenalty(noEkasa, noReceipts, firstOffense, hidden);
  const mainAmount = r.totalMax;

  return (
    <div className="space-y-4">
      <Checkbox checked={noEkasa} onChange={setNoEkasa} label="У меня нет зарегистрированной eKasa" />
      <Checkbox checked={noReceipts} onChange={setNoReceipts} label="Я не выдавал чеки клиентам" />
      <Checkbox checked={firstOffense} onChange={setFirstOffense} label="Это первое нарушение" />
      <NumberInput label="Примерная сумма необложенных продаж" value={hidden} onChange={setHidden} max={100000} step={500} />

      <ResultBlock amount={mainAmount}>
        {noEkasa && (
          <ResultRow
            label="Штраф за отсутствие eKasa"
            value={firstOffense ? `${fmt(C.EKASA_FIRST_MIN)} — ${fmt(C.EKASA_FIRST_MAX)}` : `${fmt(C.EKASA_REPEAT_MIN)} — ${fmt(C.EKASA_REPEAT_MAX)}`}
          />
        )}
        {noReceipts && (
          <ResultRow
            label="Штраф за невыдачу чеков"
            value={firstOffense ? `${fmt(C.EKASA_FIRST_MIN)} — ${fmt(C.EKASA_FIRST_MAX)}` : `${fmt(C.EKASA_REPEAT_MIN)} — ${fmt(C.EKASA_REPEAT_MAX)}`}
          />
        )}
        {hidden > 0 && <ResultRow label="Доначисление налога (19%)" value={fmt(r.taxOnHidden)} />}
        {hidden > 0 && <ResultRow label="Доначисление DPH (23%)" value={fmt(r.dphOnHidden)} />}
        <ResultRow label="Итого" value={<span className={severityColor(mainAmount)}>{fmt(r.totalMin)} — {fmt(r.totalMax)}</span>} bold />
      </ResultBlock>

      <DetailsToggle title="Кто обязан использовать eKasa">
        <p>С 2026 (zákon 384/2025): <strong>ВСЕ</strong> предприниматели, принимающие наличные или карту от физлиц.</p>
        <p>Исключения для сферы услуг <strong>отменены</strong>.</p>
        <p>С 01.05.2026: обязательно принимать безналичную оплату при покупке от €1.</p>
        <p>Виртуальная eKasa бесплатна для большинства SZČO.</p>
      </DetailsToggle>

      <div className="rounded-lg p-3 bg-red-500/5 border border-red-500/20">
        <p className="text-xs text-red-300 leading-relaxed">
          <strong>Не рискуй</strong> — штраф за одну контрольную закупку может перекрыть годовой доход.
          Регистрация eKasa занимает день, виртуальная eKasa бесплатна.
          В 2024 году 45% контрольных закупок выявили нарушения.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIOLATIONS CONFIG
// ═══════════════════════════════════════════════════════════════════════

const violations = [
  {
    id: 'dp',
    icon: '⚠️',
    title: 'Опоздал с daňové priznanie',
    desc: 'Срок — 31 марта. Можно продлить до 30 июня одним кликом, но если не успел — штраф растёт.',
    critical: false,
    Component: Card1,
  },
  {
    id: 'dph',
    icon: '⚠️',
    title: 'Не зарегистрировался на DPH вовремя',
    desc: 'Оборот за год превысил €50 000 — обязан зарегистрироваться за 5 дней. Опоздание = доначисление DPH задним числом.',
    critical: false,
    Component: Card2,
  },
  {
    id: 'payment',
    icon: '⚠️',
    title: 'Просрочил уплату налога',
    desc: 'Декларацию подал, но налог не оплатил вовремя. Penále капает каждый день.',
    critical: false,
    Component: Card3,
  },
  {
    id: 'social',
    icon: '⚠️',
    title: 'Просрочил Sociálna poisťovňa',
    desc: 'Не заплатил месячный взнос или подал отчёт с опозданием.',
    critical: false,
    Component: Card4,
  },
  {
    id: 'health',
    icon: '⚠️',
    title: 'Просрочил Zdravotná poisťovňa',
    desc: 'Не заплатил взнос в zdravotnú poisťovňu или не подал oznámenie.',
    critical: false,
    Component: Card5,
  },
  {
    id: 'blackwork',
    icon: '🚨',
    title: 'Работаю без živnosti (čierna práca)',
    desc: 'Принимаешь оплату за услуги без оформления. Самое серьёзное — штрафы до €200 000 плюс доначисление налогов.',
    critical: true,
    Component: Card6,
  },
  {
    id: 'ekasa',
    icon: '🚨',
    title: 'Нарушение eKasa (наличные без чека)',
    desc: 'Принимаешь наличные или карту от физлиц — обязан использовать eKasa и выдавать чек. С 2026 штрафы выросли в 5-6 раз.',
    critical: true,
    Component: Card7,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function PenaltyCalc() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="space-y-3">
      {violations.map((v) => {
        const isOpen = openId === v.id;
        return (
          <div
            key={v.id}
            className={`rounded-xl border transition-all overflow-hidden ${
              v.critical
                ? isOpen ? 'border-red-500/40 bg-red-500/5' : 'border-red-500/20 hover:border-red-500/40'
                : isOpen ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/50 hover:border-amber-500/30'
            }`}
          >
            <button
              onClick={() => toggle(v.id)}
              className="w-full text-left p-4 flex items-start gap-3"
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{v.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{v.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{v.desc}</div>
              </div>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform mt-1 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-border/30 pt-4">
                  <v.Component />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="mt-6 rounded-xl p-4 glass border border-border/30">
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          Расчёт носит ознакомительный характер. Реальные штрафы зависят от конкретных обстоятельств,
          истории нарушений и решения налогового инспектора. Указанные формулы и ставки соответствуют
          законодательству на апрель 2026 (ECB ставка 2.15%).{' '}
          <strong>Даňová amnestia 2026:</strong> долги до 30.09.2025, оплаченные до 30.06.2026 — штрафы и úroky прощаются.
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-2">
          Для точного анализа твоей ситуации —{' '}
          <a href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
            записаться на консультацию <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
