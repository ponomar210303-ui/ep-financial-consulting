'use client';
import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
// STRINGS
// ═══════════════════════════════════════════════════════════════════════
// Detail lists are arrays of [boldTitle, text] pairs (boldTitle may be '').

const STRINGS = {
  sk: {
    criticalBadge: 'Vysoké riziko',
    howCalc: 'Ako sa to počíta',
    total: 'Spolu',
    monthsUnit: 'mes.',
    daysUnit: 'dní',
    advice: {
      low: 'Bez paniky. Napravte to čo najskôr, pokuta je minimálna.',
      mid: 'Stojí za to riešiť to rýchlo, pokuta rastie s každým dňom či mesiacom.',
      high: 'Ide o vysokú sumu. Pred ďalším krokom sa poraďte, možno existuje spôsob, ako ju znížiť.',
    },
    individual: 'individuálne',

    c1: {
      tax: 'Suma dane na doplatenie',
      months: 'Mesiacov omeškania',
      extended: 'Podal(a) som oznámenie o predĺžení lehoty do 30. júna',
      okTitle: 'Ste v predĺženej lehote, pokuta sa nepočíta.',
      okText: 'Daňové priznanie podajte najneskôr do 30. júna.',
      filing: 'Pokuta za nepodanie daňového priznania (§154)',
      penale: (d) => `Penále za doplatok dane (10 % ročne × ${d} dní)`,
      details: [
        ['Pokuta za nepodanie (§154 daňového poriadku):', 'od 100 € do 30 000 €. Závisí od sumy dane, dĺžky omeškania a rozhodnutia správcu dane.'],
        ['Penále (§155):', '3-násobok sadzby ECB (min. 10 %) ročne zo sumy dane, počíta sa po dňoch. Najviac 100 % sumy dane.'],
        ['Pravidlo druhej šance:', 'prvé porušenie môže byť odpustené (od roku 2024).'],
        ['Zľava o tretinu (od 2026):', 'pri zaplatení do 15 dní.'],
      ],
      detailsExt: ['Predĺženie:', 'ak oznámenie podáte do 31. marca, lehota sa posúva na 30. júna. Prvé 3 mesiace sa nepočítajú ako omeškanie.'],
    },
    c2: {
      revenue: 'Obrat nad hranicou (50 000 €)',
      months: 'Mesiacov od prekročenia hranice',
      backAssessment: 'Doplatok DPH (23 %)',
      regFine: 'Pokuta za neskorú registráciu (§154)',
      penale: 'Penále z doplatku DPH (15 % ročne)',
      details: [
        ['Hranica (od 2025):', '50 000 € za kalendárny rok, prihlášku na registráciu treba podať do 5 pracovných dní.'],
        ['Okamžitá hranica:', '62 500 €, registrácia nastáva dňom prekročenia.'],
        ['Omeškanie nad 30 dní:', 'treba podať mimoriadne daňové priznanie k DPH za celé obdobie od 31. dňa.'],
        ['Pokuta (§154, od 2026):', 'od 100 € do 30 000 €.'],
        ['', 'Zdroj: zákon č. 222/2004 Z. z. o DPH, §4, §55, §78'],
      ],
    },
    c3: {
      tax: 'Suma nezaplatenej dane',
      days: 'Dní omeškania',
      penale: (tax, d) => `Penále (${tax} × 15 % × ${d} / 365)`,
      totalDue: 'Spolu na úhradu (daň + penále)',
      details: [
        ['Vzorec (§156):', 'suma × sadzba × dni / 365'],
        ['Sadzba:', '4-násobok ECB (2,15 %) = 8,6 %, minimálne však 15 %, preto sa uplatní 15 % ročne.'],
        ['Minimum:', 'penále sa nevyrubuje, ak je nižšie ako 5 €.'],
        ['Príklad:', '6 000 € × 15 % × 22 dní / 365 = 54,20 €'],
      ],
    },
    c4: {
      debt: 'Suma nezaplatených odvodov',
      months: 'Mesiacov omeškania',
      penale: (d) => `Penále (0,05 % denne × ${d} dní)`,
      vykaz: 'Pokuta za nepodanie výkazu',
      details: [
        ['Penále (§240):', '0,05 % denne zo sumy dlhu (= 18,25 % ročne). Najviac 100 % dlhu.'],
        ['Nevyrubuje sa,', 'ak je penále nižšie ako 5 €.'],
        ['Pokuta za výkaz (§239):', 'od 5 € do 1 330 € za každý nepodaný výkaz.'],
        ['Pravidlo 7 dní:', 'ak výkaz podáte do 7 dní po lehote, pokuta sa neukladá.'],
        ['Splátkový kalendár:', 'Sociálna poisťovňa často umožňuje splátky, obráťte sa na ňu.'],
      ],
    },
    c5: {
      debt: 'Suma nezaplatených odvodov',
      months: 'Mesiacov omeškania',
      interest: (d) => `Úrok z omeškania (15 % ročne × ${d} dní)`,
      notif: 'Pokuta za nepodanie oznámenia (ÚDZS)',
      details: [
        ['Úrok (§18 z. č. 580/2004):', '(dlh × dni × 15 %) / 36 500. Sadzba: 4-násobok ECB, minimálne 15 %.'],
        ['Pokuty (§26):', 'ukladá ÚDZS (nie poisťovňa). Do 165 € (poistenec), do 3 319 € (platiteľ).'],
        ['Opakované porušenie:', 'pokuta sa v priebehu 2 rokov zdvojnásobuje.'],
      ],
    },
    c6: {
      worker: 'Pracujem bez živnosti',
      employer: 'Zamestnal(a) som osobu bez riadneho pracovnoprávneho vzťahu',
      income: 'Orientačný príjem za obdobie',
      months: 'Mesiacov práce bez registrácie',
      workerFine: 'Pokuta za nelegálnu prácu (priestupok)',
      taxBack: 'Doplatok dane (~19 %)',
      socialBack: 'Doplatok odvodov (~34 %)',
      penale: 'Penále z doplatkov',
      employerFine: 'Pokuta pre objednávateľa (§19 z. č. 125/2006)',
      employerPlus: 'Plus spätné doplatenie všetkých odvodov',
      employerEst: 'Orientačná pokuta',
      detectTitle: 'Ako sa to zvyčajne odhalí',
      detect: [
        ['Kontroly inšpektorátu práce:', 'neohlásené návštevy, kontrolné nákupy.'],
        ['Podnety:', 'bývalí klienti, konkurencia, susedia.'],
        ['Bankové transakcie:', 'pravidelné platby bez zmluvy sú podozrivé.'],
        ['Krížové kontroly:', 'Sociálna poisťovňa × Finančná správa, ak je príjem, ale odvody sa neplatia.'],
        ['Od 2026:', 'definícia závislej práce je jednoduchšia, preukázať „švarcsystém“ je ľahšie.'],
      ],
      conseqTitle: 'Ďalšie dôsledky',
      conseq: [
        ['Register:', '5 rokov vo verejnom registri nelegálnych zamestnávateľov (ip.gov.sk)'],
        ['Verejné obstarávanie:', 'vylúčenie na 3 roky'],
        ['Dotácie EÚ:', 'nedostupné 3 roky'],
        ['Trestná zodpovednosť (§276 Trestného zákona):', 'od 1 do 12 rokov pri vyšších sumách'],
      ],
      noteTitle: 'Ide o najrizikovejšie porušenie.',
      note: 'Čím skôr sa zlegalizujete, tým menej sa doplatí. Založenie živnosti trvá 4 dni a správny poplatok je 5 €.',
    },
    c7: {
      noEkasa: 'Nemám zaregistrovanú eKasu',
      noReceipts: 'Nevydával(a) som klientom doklady',
      first: 'Ide o prvé porušenie',
      hidden: 'Približná suma nezdaňovaných tržieb',
      fineNoEkasa: 'Pokuta za chýbajúcu eKasu',
      fineNoReceipts: 'Pokuta za nevydanie dokladov',
      taxHidden: 'Doplatok dane (19 %)',
      dphHidden: 'Doplatok DPH (23 %)',
      whoTitle: 'Kto musí používať eKasu',
      who: [
        ['Od 2026 (zákon 384/2025):', 'eKasu musia používať všetci podnikatelia, ktorí prijímajú hotovosť alebo kartu od fyzických osôb.'],
        ['Výnimky pre služby:', 'zrušené.'],
        ['Od 1. 5. 2026:', 'pri nákupe od 1 € je povinné prijať bezhotovostnú platbu.'],
        ['', 'Virtuálna eKasa je pre väčšinu SZČO bezplatná.'],
      ],
      noteTitle: 'Neriskujte.',
      note: 'Pokuta za jeden kontrolný nákup môže prevýšiť ročný príjem. Registrácia eKasy trvá deň a virtuálna eKasa je bezplatná. V roku 2024 odhalili porušenia pri 45 % kontrolných nákupov.',
    },

    violations: {
      dp: {
        title: 'Neskoré podanie daňového priznania',
        desc: 'Lehota je 31. marec. Dá sa predĺžiť do 30. júna oznámením, ale ak ju zmeškáte, pokuta rastie.',
      },
      dph: {
        title: 'Neskorá registrácia na DPH',
        desc: 'Ak obrat za rok prekročí 50 000 €, treba sa zaregistrovať do 5 dní. Pri omeškaní sa DPH doplácia spätne.',
      },
      payment: {
        title: 'Neskoré zaplatenie dane',
        desc: 'Priznanie je podané, ale daň nebola zaplatená včas. Penále sa počíta každý deň.',
      },
      social: {
        title: 'Omeškanie so Sociálnou poisťovňou',
        desc: 'Nezaplatený mesačný odvod alebo neskoro podaný výkaz.',
      },
      health: {
        title: 'Omeškanie so Zdravotnou poisťovňou',
        desc: 'Nezaplatený odvod do zdravotnej poisťovne alebo nepodané oznámenie.',
      },
      blackwork: {
        title: 'Práca bez živnosti (čierna práca)',
        desc: 'Príjem za služby bez zákonného oprávnenia. Najzávažnejšie porušenie: pokuty do 200 000 € a doplatenie daní.',
      },
      ekasa: {
        title: 'Porušenie pravidiel eKasa (hotovosť bez dokladu)',
        desc: 'Pri prijímaní hotovosti alebo karty od fyzických osôb je eKasa a vydanie dokladu povinné. Od 2026 sa pokuty zvýšili 5- až 6-násobne.',
      },
    },

    disclaimerMain: 'Skutočné pokuty závisia od konkrétnych okolností, histórie porušení a rozhodnutia správcu dane. Vzorce a sadzby zodpovedajú právnej úprave k aprílu 2026 (sadzba ECB 2,15 %).',
    amnestyTitle: 'Daňová amnestia 2026:',
    amnesty: 'pri dlhoch do 30. 9. 2025 zaplatených do 30. 6. 2026 sa pokuty a úroky odpúšťajú.',
    disclaimer: 'Výpočet je orientačný a nenahrádza daňové poradenstvo.',
  },

  en: {
    criticalBadge: 'High risk',
    howCalc: 'How it is calculated',
    total: 'Total',
    monthsUnit: 'mo.',
    daysUnit: 'days',
    advice: {
      low: 'No need to panic. Fix it as soon as you can, the penalty is minimal.',
      mid: 'Worth sorting out soon: the penalty grows with every day or month.',
      high: 'This is a significant amount. Get advice before acting, there may be a way to reduce it.',
    },
    individual: 'case by case',

    c1: {
      tax: 'Tax amount due',
      months: 'Months late',
      extended: 'I filed a notice of extension to 30 June (oznámenie o predĺžení)',
      okTitle: 'You are within the extended deadline, so no penalty applies.',
      okText: 'File the tax return by 30 June at the latest.',
      filing: 'Fine for not filing the tax return (§154)',
      penale: (d) => `Penále on the tax due (10% p.a. × ${d} days)`,
      details: [
        ['Fine for not filing (§154 of the Tax Code):', 'from €100 to €30,000. Depends on the tax amount, how late you are and the tax officer\'s decision.'],
        ['Penále (§155):', '3× the ECB rate (min. 10%) per year on the tax amount, calculated daily. Capped at 100% of the tax.'],
        ['Second-chance rule:', 'a first offence may be waived (since 2024).'],
        ['One-third discount (from 2026):', 'if paid within 15 days.'],
      ],
      detailsExt: ['Extension:', 'if you file the notice by 31 March, the deadline moves to 30 June. The first 3 months do not count as late.'],
    },
    c2: {
      revenue: 'Revenue over the threshold (€50,000)',
      months: 'Months since exceeding the threshold',
      backAssessment: 'Additional VAT (DPH) (23%)',
      regFine: 'Fine for late registration (§154)',
      penale: 'Penále on the additional DPH (15% p.a.)',
      details: [
        ['Threshold (from 2025):', '€50,000 per calendar year, the registration application is due within 5 working days.'],
        ['Immediate threshold:', '€62,500, registration applies from the day it is exceeded.'],
        ['More than 30 days late:', 'an extraordinary DPH return must be filed for the whole period from day 31.'],
        ['Fine (§154, from 2026):', 'from €100 to €30,000.'],
        ['', 'Source: Act No. 222/2004 Coll. on DPH, §4, §55, §78'],
      ],
    },
    c3: {
      tax: 'Unpaid tax amount',
      days: 'Days late',
      penale: (tax, d) => `Penále (${tax} × 15% × ${d} / 365)`,
      totalDue: 'Total to pay (tax + penále)',
      details: [
        ['Formula (§156):', 'amount × rate × days / 365'],
        ['Rate:', '4× ECB (2.15%) = 8.6%, but at least 15%, so 15% per year applies.'],
        ['Minimum:', 'no penále is charged if it is below €5.'],
        ['Example:', '€6,000 × 15% × 22 days / 365 = €54.20'],
      ],
    },
    c4: {
      debt: 'Unpaid contributions',
      months: 'Months late',
      penale: (d) => `Penále (0.05% per day × ${d} days)`,
      vykaz: 'Fine for not filing the výkaz (report)',
      details: [
        ['Penále (§240):', '0.05% per day of the debt (= 18.25% per year). Capped at 100% of the debt.'],
        ['Not charged', 'if the penále is below €5.'],
        ['Fine for the výkaz (§239):', 'from €5 to €1,330 for each missed report.'],
        ['7-day rule:', 'if you file within 7 days after the deadline, no fine is imposed.'],
        ['Instalment plan:', 'Sociálna poisťovňa often agrees to instalments, so contact them.'],
      ],
    },
    c5: {
      debt: 'Unpaid contributions',
      months: 'Months late',
      interest: (d) => `Late-payment interest (15% p.a. × ${d} days)`,
      notif: 'Fine for not filing the notification (ÚDZS)',
      details: [
        ['Interest (§18 of Act 580/2004):', '(debt × days × 15%) / 36,500. Rate: 4× ECB, at least 15%.'],
        ['Fines (§26):', 'imposed by the ÚDZS (the health insurance supervisor), not the insurer. Up to €165 (insured person), up to €3,319 (payer).'],
        ['Repeat offence:', 'the fine doubles within 2 years.'],
      ],
    },
    c6: {
      worker: 'I work without a trade licence (živnosť)',
      employer: 'I hired someone without a proper employment relationship',
      income: 'Approximate income for the period',
      months: 'Months worked without registration',
      workerFine: 'Fine for illegal work (priestupok, administrative offence)',
      taxBack: 'Additional income tax (~19%)',
      socialBack: 'Additional contributions (~34%)',
      penale: 'Penále on the additional amounts',
      employerFine: 'Fine for the client (§19 of Act 125/2006)',
      employerPlus: 'Plus retroactive payment of all contributions',
      employerEst: 'Estimated fine',
      detectTitle: 'How it is usually detected',
      detect: [
        ['Labour inspectorate checks:', 'unannounced visits, test purchases.'],
        ['Tips:', 'former clients, competitors, neighbours.'],
        ['Bank transactions:', 'regular payments without a contract look suspicious.'],
        ['Cross-checks:', 'Sociálna poisťovňa × Finančná správa, when there is income but no contributions are paid.'],
        ['From 2026:', 'the definition of dependent work is simpler, so proving "Schwarz system" is easier.'],
      ],
      conseqTitle: 'Further consequences',
      conseq: [
        ['Register:', '5 years in the public register of illegal employers (ip.gov.sk)'],
        ['Public procurement:', 'exclusion for 3 years'],
        ['EU subsidies:', 'unavailable for 3 years'],
        ['Criminal liability (§276 of the Criminal Code):', '1 to 12 years for significant amounts'],
      ],
      noteTitle: 'This is the riskiest violation.',
      note: 'The sooner you legalise your activity, the less will be assessed. Registering a živnosť takes 4 days and costs a €5 fee.',
    },
    c7: {
      noEkasa: 'I have no registered eKasa',
      noReceipts: 'I did not issue receipts to customers',
      first: 'This is the first offence',
      hidden: 'Approximate amount of untaxed sales',
      fineNoEkasa: 'Fine for missing eKasa',
      fineNoReceipts: 'Fine for not issuing receipts',
      taxHidden: 'Additional income tax (19%)',
      dphHidden: 'Additional DPH (23%)',
      whoTitle: 'Who must use eKasa',
      who: [
        ['From 2026 (Act 384/2025):', 'all businesses that accept cash or card from individuals must use eKasa.'],
        ['Exemptions for services:', 'abolished.'],
        ['From 1 May 2026:', 'accepting cashless payment is mandatory for purchases from €1.'],
        ['', 'Virtual eKasa is free for most SZČO.'],
      ],
      noteTitle: 'Do not take the risk.',
      note: 'The fine for a single test purchase can exceed a year\'s income. Registering eKasa takes a day and virtual eKasa is free. In 2024, 45% of test purchases uncovered violations.',
    },

    violations: {
      dp: {
        title: 'Tax return filed late (daňové priznanie)',
        desc: 'The deadline is 31 March. It can be extended to 30 June by a notice, but if you miss it, the fine grows.',
      },
      dph: {
        title: 'Late DPH (VAT) registration',
        desc: 'If annual revenue exceeds €50,000, you must register within 5 days. If you are late, DPH is assessed retroactively.',
      },
      payment: {
        title: 'Tax paid late',
        desc: 'The return was filed but the tax was not paid on time. Penále accrues every day.',
      },
      social: {
        title: 'Late payment to Sociálna poisťovňa',
        desc: 'An unpaid monthly contribution or a report filed late.',
      },
      health: {
        title: 'Late payment to Zdravotná poisťovňa',
        desc: 'An unpaid health insurance contribution or a notification not filed.',
      },
      blackwork: {
        title: 'Working without a živnosť (undeclared work)',
        desc: 'Receiving payment for services without legal authorisation. The most serious violation: fines up to €200,000 plus additional taxes.',
      },
      ekasa: {
        title: 'eKasa violation (cash without a receipt)',
        desc: 'If you accept cash or card from individuals, you must use eKasa and issue a receipt. Fines have risen 5 to 6 times since 2026.',
      },
    },

    disclaimerMain: 'Actual penalties depend on the specific circumstances, the history of violations and the decision of the tax officer. The formulas and rates reflect the legislation as of April 2026 (ECB rate 2.15%).',
    amnestyTitle: 'Tax amnesty 2026:',
    amnesty: 'for debts up to 30 September 2025 paid by 30 June 2026, penalties and interest are waived.',
    disclaimer: 'This is an estimate, not tax advice.',
  },

  ru: {
    criticalBadge: 'Критично',
    howCalc: 'Как считается',
    total: 'Итого',
    monthsUnit: 'мес.',
    daysUnit: 'дн.',
    advice: {
      low: 'Не паникуй. Исправь как можно скорее — штраф минимальный.',
      mid: 'Стоит исправить срочно — каждый день/месяц штраф растёт.',
      high: 'Серьёзная сумма — лучше сразу проконсультируйся, возможно есть способ минимизировать.',
    },
    individual: 'индивидуально',

    c1: {
      tax: 'Сумма налога к доплате',
      months: 'Месяцев просрочки',
      extended: 'Я подал уведомление о продлении до 30 июня (oznámenie o predĺžení)',
      okTitle: 'Ты в пределах продлённого срока — штрафа нет!',
      okText: 'Главное — подай декларацию до 30 июня.',
      filing: 'Штраф за неподачу декларации (§154)',
      penale: (d) => `Penále за доначисление (10% годовых × ${d} дней)`,
      details: [
        ['Штраф за неподачу (§154 daň. poriadku):', 'от €100 до €30 000. Зависит от суммы налога, срока просрочки и решения инспектора.'],
        ['Penále (§155):', '3× ставка ECB (мин. 10%) годовых от суммы налога, считается подённо. Макс. 100% суммы налога.'],
        ['Правило «второго шанса»:', 'первое нарушение может быть прощено (с 2024).'],
        ['Скидка 1/3 (с 2026):', 'при оплате в течение 15 дней.'],
      ],
      detailsExt: ['Продление:', 'при подаче oznámenia до 31 марта срок переносится на 30 июня. Первые 3 месяца не считаются просрочкой.'],
    },
    c2: {
      revenue: 'Оборот сверх порога (€50 000)',
      months: 'Месяцев после превышения',
      backAssessment: 'Доначисление DPH (23%)',
      regFine: 'Штраф за просрочку регистрации (§154)',
      penale: 'Penále на доначисленную DPH (15% год.)',
      details: [
        ['Порог (с 2025):', '€50 000 за календарный год → подать заявление в течение 5 рабочих дней.'],
        ['Срочный порог:', '€62 500 → немедленная регистрация в день превышения.'],
        ['Опоздание >30 дней:', 'подать чрезвычайную декларацию DPH за весь период с 31-го дня.'],
        ['Штраф (§154, с 2026):', 'от €100 до €30 000.'],
        ['', 'Источник: zákon č. 222/2004 Z.z. о DPH, §4, §55, §78'],
      ],
    },
    c3: {
      tax: 'Сумма неуплаченного налога',
      days: 'Дней просрочки',
      penale: (tax, d) => `Penále (${tax} × 15% × ${d} / 365)`,
      totalDue: 'Итого к оплате (налог + penále)',
      details: [
        ['Формула (§156):', 'сумма × ставка × дней / 365'],
        ['Ставка:', '4× ECB (2.15%) = 8.6%, но минимум 15% → применяется 15% годовых'],
        ['Минимум:', 'не начисляется если úrok < €5'],
        ['Пример:', '€6 000 × 15% × 22 дня / 365 = €54,20'],
      ],
    },
    c4: {
      debt: 'Сумма неуплаченных взносов',
      months: 'Месяцев просрочки',
      penale: (d) => `Penále (0.05%/день × ${d} дн.)`,
      vykaz: 'Штраф за неподачу výkazu',
      details: [
        ['Penále (§240):', '0.05% в день от суммы долга (= 18.25% годовых). Не более 100% долга.'],
        ['Не начисляется', 'если penále < €5.'],
        ['Штраф за výkaz (§239):', 'от €5 до €1 330 за каждый пропущенный отчёт.'],
        ['Правило 7 дней:', 'если подашь в течение 7 дней после срока — штраф не налагается.'],
        ['Splátkový kalendár:', 'Sociálna poisťovňa часто идёт на рассрочку — обратись к ним.'],
      ],
    },
    c5: {
      debt: 'Сумма неуплаченных взносов',
      months: 'Месяцев просрочки',
      interest: (d) => `Úrok z omeškania (15% год. × ${d} дн.)`,
      notif: 'Штраф за неподачу oznámenia (ÚDZS)',
      details: [
        ['Úrok (§18 z.č. 580/2004):', '(долг × дни × 15%) / 36 500. Ставка: 4× ECB, мин. 15%.'],
        ['Pokuty (§26):', 'налагает ÚDZS (не страховая). До €165 (застрахованный), до €3 319 (плательщик).'],
        ['Повторное нарушение:', 'штраф удваивается в течение 2 лет.'],
      ],
    },
    c6: {
      worker: 'Я работаю без оформленной živnosti',
      employer: 'Я нанял человека без оформления',
      income: 'Примерный доход за период',
      months: 'Месяцев работы без оформления',
      workerFine: 'Штраф за nelegálnu prácu (priestupok)',
      taxBack: 'Доначисление налога (~19%)',
      socialBack: 'Доначисление взносов (~34%)',
      penale: 'Penále на доначисления',
      employerFine: 'Штраф для заказчика (§19 z.č. 125/2006)',
      employerPlus: 'Плюс доначисление всех взносов задним числом',
      employerEst: 'Ориентировочный штраф',
      detectTitle: 'Как обычно вскрывается',
      detect: [
        ['Проверки Inšpektorátu práce:', 'неанонсированные визиты, контрольные закупки.'],
        ['Жалобы:', 'бывшие клиенты, конкуренты, соседи.'],
        ['Банковские транзакции:', 'регулярные переводы без договора = подозрение.'],
        ['Кросс-проверки:', 'Sociálna poisťovňa × Finančná správa — если доход есть, а взносы не платятся.'],
        ['С 2026:', 'определение зависимой работы упрощено — доказать «шварц-систем» стало легче.'],
      ],
      conseqTitle: 'Дополнительные последствия',
      conseq: [
        ['Реестр:', '5 лет в публичном реестре нелегальных работодателей (ip.gov.sk)'],
        ['Госзакупки:', 'исключение на 3 года'],
        ['Субсидии ЕС:', 'недоступны 3 года'],
        ['Уголовная ответственность (§276 Trestného zákona):', 'от 1 до 12 лет при значительных суммах'],
      ],
      noteTitle: 'Это самое опасное нарушение.',
      note: 'Чем раньше легализуешься — тем меньше доначислят. Открыть živnosť — 4 дня и €5 пошлины.',
      // Old CTA text, kept for reference only (not rendered).
      oldCta: 'Если уже работаешь несколько месяцев — давай обсудим, как минимизировать риски',
    },
    c7: {
      noEkasa: 'У меня нет зарегистрированной eKasa',
      noReceipts: 'Я не выдавал чеки клиентам',
      first: 'Это первое нарушение',
      hidden: 'Примерная сумма необложенных продаж',
      fineNoEkasa: 'Штраф за отсутствие eKasa',
      fineNoReceipts: 'Штраф за невыдачу чеков',
      taxHidden: 'Доначисление налога (19%)',
      dphHidden: 'Доначисление DPH (23%)',
      whoTitle: 'Кто обязан использовать eKasa',
      who: [
        ['С 2026 (zákon 384/2025):', 'ВСЕ предприниматели, принимающие наличные или карту от физлиц.'],
        ['Исключения для сферы услуг', 'отменены.'],
        ['С 01.05.2026:', 'обязательно принимать безналичную оплату при покупке от €1.'],
        ['', 'Виртуальная eKasa бесплатна для большинства SZČO.'],
      ],
      noteTitle: 'Не рискуй',
      note: '— штраф за одну контрольную закупку может перекрыть годовой доход. Регистрация eKasa занимает день, виртуальная eKasa бесплатна. В 2024 году 45% контрольных закупок выявили нарушения.',
    },

    violations: {
      dp: {
        title: 'Опоздал с daňové priznanie',
        desc: 'Срок — 31 марта. Можно продлить до 30 июня одним кликом, но если не успел — штраф растёт.',
      },
      dph: {
        title: 'Не зарегистрировался на DPH вовремя',
        desc: 'Оборот за год превысил €50 000 — обязан зарегистрироваться за 5 дней. Опоздание = доначисление DPH задним числом.',
      },
      payment: {
        title: 'Просрочил уплату налога',
        desc: 'Декларацию подал, но налог не оплатил вовремя. Penále капает каждый день.',
      },
      social: {
        title: 'Просрочил Sociálna poisťovňa',
        desc: 'Не заплатил месячный взнос или подал отчёт с опозданием.',
      },
      health: {
        title: 'Просрочил Zdravotná poisťovňa',
        desc: 'Не заплатил взнос в zdravotnú poisťovňu или не подал oznámenie.',
      },
      blackwork: {
        title: 'Работаю без živnosti (čierna práca)',
        desc: 'Принимаешь оплату за услуги без оформления. Самое серьёзное — штрафы до €200 000 плюс доначисление налогов.',
      },
      ekasa: {
        title: 'Нарушение eKasa (наличные без чека)',
        desc: 'Принимаешь наличные или карту от физлиц — обязан использовать eKasa и выдавать чек. С 2026 штрафы выросли в 5-6 раз.',
      },
    },

    disclaimerMain: 'Расчёт носит ознакомительный характер. Реальные штрафы зависят от конкретных обстоятельств, истории нарушений и решения налогового инспектора. Указанные формулы и ставки соответствуют законодательству на апрель 2026 (ECB ставка 2.15%).',
    amnestyTitle: 'Даňová amnestia 2026:',
    amnesty: 'долги до 30.09.2025, оплаченные до 30.06.2026 — штрафы и úroky прощаются.',
    disclaimer: 'Не является налоговой консультацией.',
    // Old CTA text, kept for reference only (not rendered).
    oldCta: 'Для точного анализа твоей ситуации — записаться на консультацию',
  },
};

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════

function makeFmt(locale) {
  const nf = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'sk-SK', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0,
  });
  return (n) => nf.format(Math.round(n));
}

// Severity styling: neutral < 100, amber <= 500, red above.
function severity(amount) {
  if (amount < 100) return { level: 'low', text: 'text-foreground', advice: 'text-muted-foreground', box: 'border-border bg-muted' };
  if (amount <= 500) return { level: 'mid', text: 'text-amber-700', advice: 'text-amber-700', box: 'border-amber-200 bg-amber-50' };
  return { level: 'high', text: 'text-red-700', advice: 'text-red-700', box: 'border-red-200 bg-red-50' };
}

const INPUT_CLASS =
  'w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary';

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function NumberInput({ value, onChange, label, suffix = '€', min = 0, max = 999999, step = 100 }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2 mt-1.5">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(Math.max(min, Math.min(max, +e.target.value || 0)))}
          className={`${INPUT_CLASS} font-mono tabular-nums`}
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
  const id = useId();
  return (
    <div>
      <div className="flex justify-between items-baseline gap-3">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        <span className="text-sm font-mono tabular-nums font-semibold whitespace-nowrap">{value} {suffix}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full mt-1.5 accent-primary"
      />
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  const id = useId();
  return (
    <div className="flex items-start gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
      />
      <label htmlFor={id} className="text-sm leading-snug cursor-pointer">{label}</label>
    </div>
  );
}

function RadioGroup({ value, onChange, options }) {
  const name = useId();
  return (
    <div className="space-y-2" role="radiogroup">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
          />
          <span className="text-sm leading-snug">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function ResultBlock({ children, amount, t }) {
  const sev = severity(amount);
  return (
    <div className={`rounded-xl border p-4 sm:p-5 space-y-3 ${sev.box}`}>
      {children}
      <p className={`text-xs ${sev.advice}`}>{t.advice[sev.level]}</p>
    </div>
  );
}

function DetailList({ items }) {
  return items.map(([title, text], i) => (
    <p key={i}>{title && <strong className="font-semibold text-foreground">{title}</strong>}{title ? ' ' : ''}{text}</p>
  ));
}

function DetailsToggle({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {title}
      </button>
      {open && <div className="mt-2 text-xs text-muted-foreground leading-relaxed space-y-1 pl-4 border-l border-border">{children}</div>}
    </div>
  );
}

function ResultRow({ label, value, bold }) {
  if (bold) {
    return (
      <div className="pt-3 border-t border-border/80">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold mt-0.5 break-words">{value}</div>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground min-w-0">{label}</span>
      <span className="font-mono tabular-nums text-sm font-semibold text-right shrink-0">{value}</span>
    </div>
  );
}

function CardLayout({ inputs, result, below }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">{inputs}</div>
        <div className="space-y-3">{result}</div>
      </div>
      {below}
    </div>
  );
}

function Note({ title, children }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-xs text-red-700 leading-relaxed">
        <strong className="font-semibold">{title}</strong> {children}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIOLATION CARDS
// ═══════════════════════════════════════════════════════════════════════

function Card1({ t, fmt }) {
  const s = t.c1;
  const [tax, setTax] = useState(1000);
  const [months, setMonths] = useState(3);
  const [extended, setExtended] = useState(false);

  const r = calculateDpDelayPenalty(tax, months, extended);
  const totalAmount = r.total;

  return (
    <CardLayout
      inputs={
        <>
          <NumberInput label={s.tax} value={tax} onChange={setTax} max={100000} step={500} />
          <SliderInput label={s.months} value={months} onChange={setMonths} min={1} max={24} suffix={t.monthsUnit} />
          <Checkbox checked={extended} onChange={setExtended} label={s.extended} />
        </>
      }
      result={
        r.effectiveMonths <= 0 ? (
          <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
            <p className="text-sm font-semibold">{s.okTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.okText}</p>
          </div>
        ) : (
          <ResultBlock amount={totalAmount} t={t}>
            <ResultRow label={s.filing} value={fmt(r.filing)} />
            <ResultRow label={s.penale(r.days)} value={fmt(r.penale)} />
            <ResultRow label={t.total} value={<span className={severity(totalAmount).text}>{fmt(totalAmount)}</span>} bold />
          </ResultBlock>
        )
      }
      below={
        <DetailsToggle title={t.howCalc}>
          <DetailList items={s.details} />
          {extended && <DetailList items={[s.detailsExt]} />}
        </DetailsToggle>
      }
    />
  );
}

function Card2({ t, fmt }) {
  const s = t.c2;
  const [revenue, setRevenue] = useState(10000);
  const [months, setMonths] = useState(3);

  const r = calculateDphRegistrationPenalty(revenue, months);

  return (
    <CardLayout
      inputs={
        <>
          <NumberInput label={s.revenue} value={revenue} onChange={setRevenue} max={500000} step={1000} />
          <SliderInput label={s.months} value={months} onChange={setMonths} min={1} max={12} suffix={t.monthsUnit} />
        </>
      }
      result={
        <ResultBlock amount={r.total} t={t}>
          <ResultRow label={s.backAssessment} value={fmt(r.dphBackAssessment)} />
          <ResultRow label={s.regFine} value={fmt(r.regFine)} />
          <ResultRow label={s.penale} value={fmt(r.penale)} />
          <ResultRow label={t.total} value={<span className={severity(r.total).text}>{fmt(r.total)}</span>} bold />
        </ResultBlock>
      }
      below={
        <DetailsToggle title={t.howCalc}>
          <DetailList items={s.details} />
        </DetailsToggle>
      }
    />
  );
}

function Card3({ t, fmt }) {
  const s = t.c3;
  const [tax, setTax] = useState(3000);
  const [days, setDays] = useState(30);

  const r = calculateLatePaymentPenalty(tax, days);

  return (
    <CardLayout
      inputs={
        <>
          <NumberInput label={s.tax} value={tax} onChange={setTax} max={100000} step={500} />
          <SliderInput label={s.days} value={days} onChange={setDays} min={1} max={365} suffix={t.daysUnit} />
        </>
      }
      result={
        <ResultBlock amount={r.interest} t={t}>
          <ResultRow label={s.penale(fmt(tax), days)} value={fmt(r.interest)} />
          <ResultRow label={s.totalDue} value={<span className={severity(r.interest).text}>{fmt(r.totalWithTax)}</span>} bold />
        </ResultBlock>
      }
      below={
        <DetailsToggle title={t.howCalc}>
          <DetailList items={s.details} />
        </DetailsToggle>
      }
    />
  );
}

function Card4({ t, fmt }) {
  const s = t.c4;
  const [debt, setDebt] = useState(500);
  const [months, setMonths] = useState(3);

  const r = calculateSocialPenalty(debt, months);

  return (
    <CardLayout
      inputs={
        <>
          <NumberInput label={s.debt} value={debt} onChange={setDebt} max={50000} step={100} />
          <SliderInput label={s.months} value={months} onChange={setMonths} min={1} max={24} suffix={t.monthsUnit} />
        </>
      }
      result={
        <ResultBlock amount={r.total} t={t}>
          <ResultRow label={s.penale(r.days)} value={fmt(r.penale)} />
          <ResultRow label={s.vykaz} value={fmt(r.vykazFine)} />
          <ResultRow label={t.total} value={<span className={severity(r.total).text}>{fmt(r.total)}</span>} bold />
        </ResultBlock>
      }
      below={
        <DetailsToggle title={t.howCalc}>
          <DetailList items={s.details} />
        </DetailsToggle>
      }
    />
  );
}

function Card5({ t, fmt }) {
  const s = t.c5;
  const [debt, setDebt] = useState(300);
  const [months, setMonths] = useState(3);

  const r = calculateHealthPenalty(debt, months);

  return (
    <CardLayout
      inputs={
        <>
          <NumberInput label={s.debt} value={debt} onChange={setDebt} max={50000} step={100} />
          <SliderInput label={s.months} value={months} onChange={setMonths} min={1} max={24} suffix={t.monthsUnit} />
        </>
      }
      result={
        <ResultBlock amount={r.total} t={t}>
          <ResultRow label={s.interest(r.days)} value={fmt(r.interest)} />
          <ResultRow label={s.notif} value={fmt(r.notifFine)} />
          <ResultRow label={t.total} value={<span className={severity(r.total).text}>{fmt(r.total)}</span>} bold />
        </ResultBlock>
      }
      below={
        <DetailsToggle title={t.howCalc}>
          <DetailList items={s.details} />
        </DetailsToggle>
      }
    />
  );
}

function Card6({ t, fmt }) {
  const s = t.c6;
  const [role, setRole] = useState('worker');
  const [income, setIncome] = useState(5000);
  const [months, setMonths] = useState(6);

  const r = calculateBlackWorkPenalty(income, months, role === 'employer');
  const mainAmount = role === 'employer' ? r.fineMax : r.totalMax;

  return (
    <CardLayout
      inputs={
        <>
          <RadioGroup
            value={role}
            onChange={setRole}
            options={[
              { value: 'worker', label: s.worker },
              { value: 'employer', label: s.employer },
            ]}
          />
          <NumberInput label={s.income} value={income} onChange={setIncome} max={200000} step={500} />
          <SliderInput label={s.months} value={months} onChange={setMonths} min={1} max={24} suffix={t.monthsUnit} />
        </>
      }
      result={
        <ResultBlock amount={mainAmount} t={t}>
          {role === 'worker' ? (
            <>
              <ResultRow label={s.workerFine} value={fmt(r.workerFine)} />
              <ResultRow label={s.taxBack} value={fmt(r.taxBackpay)} />
              <ResultRow label={s.socialBack} value={fmt(r.socialBackpay)} />
              <ResultRow label={s.penale} value={fmt(r.penale)} />
              <ResultRow label={t.total} value={<span className={severity(r.totalMax).text}>{fmt(r.totalMin)} — {fmt(r.totalMax)}</span>} bold />
            </>
          ) : (
            <>
              <ResultRow label={s.employerFine} value={`${fmt(C.NP_EMPLOYER_FINE_MIN)} — ${fmt(r.fineMax)}`} />
              <ResultRow label={s.employerPlus} value={t.individual} />
              <ResultRow label={s.employerEst} value={<span className="text-red-700">{fmt(r.fineMax)}</span>} bold />
            </>
          )}
        </ResultBlock>
      }
      below={
        <div className="space-y-3">
          <DetailsToggle title={s.detectTitle}>
            <DetailList items={s.detect} />
          </DetailsToggle>

          <DetailsToggle title={s.conseqTitle}>
            <DetailList items={s.conseq} />
          </DetailsToggle>

          <Note title={s.noteTitle}>{s.note}</Note>
        </div>
      }
    />
  );
}

function Card7({ t, fmt }) {
  const s = t.c7;
  const [noEkasa, setNoEkasa] = useState(true);
  const [noReceipts, setNoReceipts] = useState(false);
  const [firstOffense, setFirstOffense] = useState(true);
  const [hidden, setHidden] = useState(0);

  const r = calculateEkasaPenalty(noEkasa, noReceipts, firstOffense, hidden);
  const mainAmount = r.totalMax;

  const fineRange = firstOffense
    ? `${fmt(C.EKASA_FIRST_MIN)} — ${fmt(C.EKASA_FIRST_MAX)}`
    : `${fmt(C.EKASA_REPEAT_MIN)} — ${fmt(C.EKASA_REPEAT_MAX)}`;

  return (
    <CardLayout
      inputs={
        <>
          <Checkbox checked={noEkasa} onChange={setNoEkasa} label={s.noEkasa} />
          <Checkbox checked={noReceipts} onChange={setNoReceipts} label={s.noReceipts} />
          <Checkbox checked={firstOffense} onChange={setFirstOffense} label={s.first} />
          <NumberInput label={s.hidden} value={hidden} onChange={setHidden} max={100000} step={500} />
        </>
      }
      result={
        <ResultBlock amount={mainAmount} t={t}>
          {noEkasa && <ResultRow label={s.fineNoEkasa} value={fineRange} />}
          {noReceipts && <ResultRow label={s.fineNoReceipts} value={fineRange} />}
          {hidden > 0 && <ResultRow label={s.taxHidden} value={fmt(r.taxOnHidden)} />}
          {hidden > 0 && <ResultRow label={s.dphHidden} value={fmt(r.dphOnHidden)} />}
          <ResultRow label={t.total} value={<span className={severity(mainAmount).text}>{fmt(r.totalMin)} — {fmt(r.totalMax)}</span>} bold />
        </ResultBlock>
      }
      below={
        <div className="space-y-3">
          <DetailsToggle title={s.whoTitle}>
            <DetailList items={s.who} />
          </DetailsToggle>

          <Note title={s.noteTitle}>{s.note}</Note>
        </div>
      }
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// VIOLATIONS CONFIG
// ═══════════════════════════════════════════════════════════════════════

const violations = [
  { id: 'dp', critical: false, Component: Card1 },
  { id: 'dph', critical: false, Component: Card2 },
  { id: 'payment', critical: false, Component: Card3 },
  { id: 'social', critical: false, Component: Card4 },
  { id: 'health', critical: false, Component: Card5 },
  { id: 'blackwork', critical: true, Component: Card6 },
  { id: 'ekasa', critical: true, Component: Card7 },
];

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export default function PenaltyCalc({ locale = 'sk' }) {
  const t = STRINGS[locale] ?? STRINGS.sk;
  const fmt = makeFmt(locale);
  const baseId = useId();
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(openId === id ? null : id);

  return (
    <div className="space-y-3">
      {violations.map((v) => {
        const isOpen = openId === v.id;
        const text = t.violations[v.id];
        const panelId = `${baseId}-${v.id}`;
        return (
          <div
            key={v.id}
            className={`rounded-xl border bg-background overflow-hidden transition-colors ${
              isOpen ? 'border-primary/50' : 'border-border hover:border-primary/30'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(v.id)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full text-left p-4 sm:p-5 flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-semibold text-base">{text.title}</span>
                  {v.critical && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700">
                      {t.criticalBadge}
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{text.desc}</div>
              </div>
              <ChevronDown className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform mt-1.5 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div id={panelId} className="px-4 sm:px-5 pb-5">
                <div className="border-t border-border pt-5">
                  <v.Component t={t} fmt={fmt} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="pt-3 space-y-1 text-xs text-muted-foreground leading-relaxed">
        <p>
          {t.disclaimerMain}{' '}
          <strong className="font-semibold text-foreground">{t.amnestyTitle}</strong> {t.amnesty}
        </p>
        <p>{t.disclaimer}</p>
      </div>
    </div>
  );
}
