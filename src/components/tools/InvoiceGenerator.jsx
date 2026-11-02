'use client';
import { useState, useEffect, useMemo, useCallback, useRef, useId, isValidElement, cloneElement } from 'react';
import { Download, Save, Plus, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ═══════════════════════════════════════════════════════════════════
// 2026 SLOVAK INVOICE CONSTANTS
// Zdroj: §74 zákona č. 222/2004 Z.z. o DPH, finančná správa SR
// Dátum overenia: apríl 2026
// ═══════════════════════════════════════════════════════════════════

const VAT_RATES = [
  { value: 23 },
  { value: 19 },
  { value: 5 },
  { value: 0 },
];

const UNITS = [
  { value: 'ks' },
  { value: 'hod' },
  { value: 'služba' },
  { value: 'm' },
  { value: 'kg' },
  { value: 'deň' },
  { value: 'mesiac' },
  { value: 'projekt' },
];

const PAYMENT_METHODS = [
  { value: 'prevod' },
  { value: 'hotovost' },
  { value: 'karta' },
];

const LANG_OPTIONS = [
  { value: 'sk' },
  { value: 'ru' },
  { value: 'both' },
];

// Bilingual labels
const L = {
  sk: {
    invoice: 'FAKTÚRA',
    invoiceNo: 'Číslo faktúry',
    supplier: 'Dodávateľ',
    buyer: 'Odberateľ',
    ico: 'IČO',
    dic: 'DIČ',
    icDph: 'IČ DPH',
    phone: 'Tel.',
    email: 'E-mail',
    dateIssued: 'Dátum vystavenia',
    dateDelivery: 'Dátum dodania',
    dateDue: 'Dátum splatnosti',
    vs: 'Variabilný symbol',
    ks: 'Konštantný symbol',
    paymentMethod: 'Forma úhrady',
    bankTransfer: 'Bankový prevod',
    cash: 'Hotovosť',
    card: 'Platobná karta',
    bank: 'Banka',
    iban: 'IBAN',
    no: 'Č.',
    description: 'Popis',
    qty: 'Množstvo',
    unit: 'Jedn.',
    unitPrice: 'Jedn. cena',
    vatRate: 'DPH %',
    total: 'Celkom',
    subtotal: 'Základ dane',
    vat: 'DPH',
    totalDue: 'Spolu na úhradu',
    notVatPayer: 'Nie sme platiteľmi DPH.',
    note: 'Poznámka',
    page: 'Strana',
  },
  ru: {
    invoice: 'ФАКТУРА',
    invoiceNo: 'Номер фактуры',
    supplier: 'Поставщик',
    buyer: 'Покупатель',
    ico: 'IČO',
    dic: 'DIČ',
    icDph: 'IČ DPH',
    phone: 'Тел.',
    email: 'E-mail',
    dateIssued: 'Дата выставления',
    dateDelivery: 'Дата поставки',
    dateDue: 'Дата оплаты',
    vs: 'Вариабильный символ',
    ks: 'Конст. символ',
    paymentMethod: 'Способ оплаты',
    bankTransfer: 'Банковский перевод',
    cash: 'Наличные',
    card: 'Карта',
    bank: 'Банк',
    iban: 'IBAN',
    no: '№',
    description: 'Описание',
    qty: 'Кол-во',
    unit: 'Ед.',
    unitPrice: 'Цена за ед.',
    vatRate: 'НДС %',
    total: 'Итого',
    subtotal: 'Сумма без НДС',
    vat: 'НДС',
    totalDue: 'К оплате',
    notVatPayer: 'Мы не являемся плательщиками НДС.',
    note: 'Примечание',
    page: 'Стр.',
  },
};

function pdfT(lang, key) {
  if (lang === 'both') return `${L.sk[key]} / ${L.ru[key]}`;
  return (L[lang] || L.sk)[key] || key;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

const STORAGE = {
  SELLER: 'ep-inv-seller',
  CLIENTS: 'ep-inv-clients',
  COUNTER: 'ep-inv-counter',
  LOGO: 'ep-inv-logo',
};

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function today() { return new Date().toISOString().slice(0, 10); }

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const stored = parseInt(localStorage.getItem(STORAGE.COUNTER) || '0', 10);
  const next = stored + 1;
  return `${year}${String(next).padStart(4, '0')}`;
}

function variabilnySymbol(num) {
  return num.replace(/[^0-9]/g, '').slice(0, 10);
}

function validateIBAN(iban) {
  if (!iban) return true;
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/.test(clean)) return false;
  if (clean.length < 15 || clean.length > 34) return false;
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => ch.charCodeAt(0) - 55);
  let remainder = '';
  for (const ch of numeric) {
    remainder = String(Number(remainder + ch) % 97);
  }
  return Number(remainder) === 1;
}

function formatIBAN(value) {
  const clean = value.replace(/\s/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

function validateICO(ico) {
  if (!ico) return true;
  return /^\d{8}$/.test(ico.replace(/\s/g, ''));
}

function calcLineTotal(qty, price) {
  return (parseFloat(qty) || 0) * (parseFloat(price) || 0);
}

function calcVatAmount(base, rate) {
  return base * (rate / 100);
}

// ═══════════════════════════════════════════════════════════════════
// UI STRINGS (on-screen only; the PDF uses the L labels above)
// ═══════════════════════════════════════════════════════════════════

const STRINGS = {
  sk: {
    sectionSeller: '1. Moje údaje (dodávateľ)',
    sectionBuyer: '2. Klient (odberateľ)',
    sectionParams: '3. Parametre faktúry',
    sectionVat: '4. Režim DPH',
    sectionItems: '5. Položky',
    sectionExtra: '6. Doplnkové nastavenia',
    logo: 'Logo',
    upload: 'Nahrať logo',
    removeLogo: 'Odstrániť logo',
    logoTooBig: 'Maximálna veľkosť súboru je 500 KB',
    name: 'Názov / meno a priezvisko *',
    namePlaceholder: 'Meno Priezvisko alebo Názov s.r.o.',
    street: 'Ulica',
    city: 'Mesto',
    zip: 'PSČ',
    country: 'Krajina',
    ico: 'IČO',
    dic: 'DIČ',
    icDph: 'IČ DPH',
    phone: 'Telefón',
    email: 'E-mail',
    bank: 'Banka',
    iban: 'IBAN',
    icoError: 'IČO: 8 číslic',
    ibanError: 'Nesprávny IBAN (napr. SK89 0200 ... alebo LT38 3250 ...)',
    pickSaved: 'Vybrať z uložených klientov',
    choose: '— vyberte —',
    invoiceNo: 'Číslo faktúry',
    dateIssued: 'Dátum vystavenia',
    dateDelivery: 'Dátum dodania',
    dateDue: 'Dátum splatnosti',
    plusDays: (d) => `+${d} dní`,
    ks: 'Konštantný symbol',
    paymentMethod: 'Spôsob úhrady',
    invoiceLang: 'Jazyk faktúry',
    payment: { prevod: 'Bankový prevod', hotovost: 'Hotovosť', karta: 'Platobná karta' },
    langOptions: { sk: 'Slovenčina', ru: 'Ruština', both: 'Slovenčina + ruština' },
    units: { ks: 'ks', hod: 'hod', 'služba': 'služba', m: 'm', kg: 'kg', 'deň': 'deň', mesiac: 'mesiac', projekt: 'projekt' },
    vatNo: 'Nie som platiteľ DPH',
    vatYes: 'Platiteľ DPH',
    vatNote: 'Na faktúre bude uvedené: „Nie sme platiteľmi DPH“',
    exemptReason: 'Dôvod oslobodenia od DPH',
    exemptPlaceholder: '§42 zákona č. 222/2004 Z. z.',
    vatRatesTitle: 'Sadzby DPH 2026',
    vat: {
      23: { label: '23 % (základná)', desc: 'Poradenstvo, IT, preklady, marketing' },
      19: { label: '19 % (znížená)', desc: 'Elektrina, potraviny, reštaurácie' },
      5: { label: '5 % (znížená)', desc: 'Knihy, lieky, ubytovanie' },
      0: { label: 'Oslobodené od DPH', desc: '§42 a nasl. zákona o DPH' },
    },
    item: 'Položka',
    desc: 'Popis',
    descPlaceholder: 'Konzultácia / Vývoj / Preklad...',
    qty: 'Množstvo',
    unit: 'Jednotka',
    priceNoVat: 'Cena bez DPH',
    vatPct: 'DPH %',
    lineNoVat: 'Bez DPH',
    lineVat: 'DPH',
    lineTotal: 'Spolu',
    addItem: 'Pridať položku',
    removeItem: 'Odstrániť položku',
    note: 'Poznámka',
    notePlaceholder: 'Ďakujeme za spoluprácu...',
    qrToggle: 'QR kód Pay by Square (pre bankový prevod)',
    summary: 'Súhrn',
    totalDue: 'Spolu na úhradu',
    amount: 'Suma',
    baseLine: (rate) => `Základ dane (${rate} %)`,
    vatLineLabel: (rate) => `DPH (${rate} %)`,
    qrHint: 'QR kód sa zobrazí pri platbe bankovým prevodom, vyplnenom IBAN a nenulovej sume.',
    download: 'Stiahnuť PDF',
    save: 'Uložiť moje údaje',
    saved: 'Uložené',
    footnote: 'Faktúra obsahuje náležitosti podľa §74 zákona č. 222/2004 Z. z. o DPH. Sadzby DPH 2026: 23 % / 19 % / 5 %. Hranica pre registráciu DPH: 50 000 € / 62 500 €.',
    disclaimer: 'Výpočet je orientačný a nenahrádza daňové poradenstvo.',
  },
  en: {
    sectionSeller: '1. My details (supplier, dodávateľ)',
    sectionBuyer: '2. Client (buyer, odberateľ)',
    sectionParams: '3. Invoice settings',
    sectionVat: '4. DPH (VAT) mode',
    sectionItems: '5. Line items (položky)',
    sectionExtra: '6. Additional options',
    logo: 'Logo',
    upload: 'Upload logo',
    removeLogo: 'Remove logo',
    logoTooBig: 'Maximum file size is 500 KB',
    name: 'Company name / full name *',
    namePlaceholder: 'Full name or company name s.r.o.',
    street: 'Street',
    city: 'City',
    zip: 'Postcode (PSČ)',
    country: 'Country',
    ico: 'IČO (company ID)',
    dic: 'DIČ (tax ID)',
    icDph: 'IČ DPH (VAT ID)',
    phone: 'Phone',
    email: 'E-mail',
    bank: 'Bank',
    iban: 'IBAN',
    icoError: 'IČO: 8 digits',
    ibanError: 'Invalid IBAN (e.g. SK89 0200 ... or LT38 3250 ...)',
    pickSaved: 'Choose from saved clients',
    choose: '— select —',
    invoiceNo: 'Invoice number',
    dateIssued: 'Issue date',
    dateDelivery: 'Delivery date',
    dateDue: 'Due date',
    plusDays: (d) => `+${d} days`,
    ks: 'Constant symbol (KS)',
    paymentMethod: 'Payment method',
    invoiceLang: 'Invoice language',
    payment: { prevod: 'Bank transfer', hotovost: 'Cash', karta: 'Payment card' },
    langOptions: { sk: 'Slovak', ru: 'Russian', both: 'Slovak + Russian' },
    units: { ks: 'ks (pcs)', hod: 'hod (hour)', 'služba': 'služba (service)', m: 'm (metre)', kg: 'kg', 'deň': 'deň (day)', mesiac: 'mesiac (month)', projekt: 'projekt (project)' },
    vatNo: 'Not a DPH payer',
    vatYes: 'DPH payer',
    vatNote: 'The invoice will state: "Nie sme platiteľmi DPH" (we are not VAT payers)',
    exemptReason: 'Reason for DPH exemption',
    exemptPlaceholder: '§42 of Act No. 222/2004 Coll.',
    vatRatesTitle: 'DPH rates 2026',
    vat: {
      23: { label: '23% (standard)', desc: 'Consulting, IT, translation, marketing' },
      19: { label: '19% (reduced)', desc: 'Electricity, food, restaurants' },
      5: { label: '5% (reduced)', desc: 'Books, medicines, accommodation' },
      0: { label: 'Exempt from DPH', desc: '§42 et seq. of the DPH Act' },
    },
    item: 'Item',
    desc: 'Description',
    descPlaceholder: 'Consulting / Development / Translation...',
    qty: 'Quantity',
    unit: 'Unit',
    priceNoVat: 'Price excl. DPH',
    vatPct: 'DPH %',
    lineNoVat: 'Excl. DPH',
    lineVat: 'DPH',
    lineTotal: 'Total',
    addItem: 'Add item',
    removeItem: 'Remove item',
    note: 'Note',
    notePlaceholder: 'Ďakujeme za spoluprácu...',
    qrToggle: 'Pay by Square QR code (for bank transfer)',
    summary: 'Summary',
    totalDue: 'Total due',
    amount: 'Amount',
    baseLine: (rate) => `Tax base (${rate}%)`,
    vatLineLabel: (rate) => `DPH (${rate}%)`,
    qrHint: 'The QR code appears for bank transfer payments when an IBAN is filled in and the total is above zero.',
    download: 'Download PDF',
    save: 'Save my details',
    saved: 'Saved',
    footnote: 'The invoice contains the particulars required by §74 of Act No. 222/2004 Coll. on DPH. DPH rates 2026: 23% / 19% / 5%. DPH registration threshold: €50,000 / €62,500.',
    disclaimer: 'This is an estimate, not tax advice.',
  },
  ru: {
    sectionSeller: '1. Мои данные (dodávateľ)',
    sectionBuyer: '2. Клиент (odberateľ)',
    sectionParams: '3. Параметры фактуры',
    sectionVat: '4. Режим DPH',
    sectionItems: '5. Позиции (položky)',
    sectionExtra: '6. Дополнительно',
    logo: 'Логотип',
    upload: 'Загрузить',
    removeLogo: 'Удалить логотип',
    logoTooBig: 'Максимум 500 KB',
    name: 'Название / ФИО *',
    namePlaceholder: 'EP. Financial Consulting',
    street: 'Улица',
    city: 'Город',
    zip: 'PSČ',
    country: 'Страна',
    ico: 'IČO',
    dic: 'DIČ',
    icDph: 'IČ DPH',
    phone: 'Телефон',
    email: 'E-mail',
    bank: 'Банк',
    iban: 'IBAN',
    icoError: 'IČO: 8 číslic',
    ibanError: 'Nesprávny IBAN (napr. SK89 0200 ... alebo LT38 3250 ...)',
    pickSaved: 'Выбрать из сохранённых',
    choose: '— выберите —',
    invoiceNo: 'Číslo faktúry',
    dateIssued: 'Dátum vystavenia',
    dateDelivery: 'Dátum dodania',
    dateDue: 'Dátum splatnosti',
    plusDays: (d) => `+${d} дн.`,
    ks: 'Konšt. symbol',
    paymentMethod: 'Способ оплаты',
    invoiceLang: 'Язык фактуры',
    payment: { prevod: 'Bankový prevod', hotovost: 'Hotovosť', karta: 'Platobná karta' },
    langOptions: { sk: 'Slovenčina', ru: 'Русский', both: 'SK + RU' },
    units: { ks: 'ks (шт.)', hod: 'hod (час)', 'služba': 'služba (услуга)', m: 'm (метр)', kg: 'kg (кг)', 'deň': 'deň (день)', mesiac: 'mesiac (месяц)', projekt: 'projekt' },
    vatNo: 'Не плательщик DPH',
    vatYes: 'Плательщик DPH',
    vatNote: 'На фактуре будет указано: «Nie sme platiteľmi DPH»',
    exemptReason: 'Основание освобождения от DPH',
    exemptPlaceholder: '§42 zákona č. 222/2004 Z.z.',
    vatRatesTitle: 'Ставки DPH 2026',
    vat: {
      23: { label: '23% (základná)', desc: 'Консалтинг, IT, переводы, маркетинг' },
      19: { label: '19% (znížená)', desc: 'Электроэнергия, продукты, рестораны' },
      5: { label: '5% (znížená)', desc: 'Книги, лекарства, проживание' },
      0: { label: 'Oslobodené od DPH', desc: '§42 a nasl. zákona o DPH' },
    },
    item: 'Позиция',
    desc: 'Описание',
    descPlaceholder: 'Konzultácia / Vývoj / Preklad...',
    qty: 'Кол-во',
    unit: 'Ед.',
    priceNoVat: 'Цена без DPH',
    vatPct: 'DPH %',
    lineNoVat: 'Без DPH',
    lineVat: 'DPH',
    lineTotal: 'Итого',
    addItem: 'Добавить позицию',
    removeItem: 'Удалить позицию',
    note: 'Poznámka / Примечание',
    notePlaceholder: 'Ďakujeme za spoluprácu...',
    qrToggle: 'QR-код Pay by Square (для банковского перевода)',
    summary: 'Сводка',
    totalDue: 'К оплате',
    amount: 'Сумма',
    baseLine: (rate) => `Základ dane (${rate}%)`,
    vatLineLabel: (rate) => `DPH (${rate}%)`,
    qrHint: 'QR-код появится при оплате банковским переводом, указанном IBAN и сумме больше нуля.',
    download: 'Скачать PDF',
    save: 'Сохранить мои данные',
    saved: 'Сохранено!',
    footnote: 'Фактура соответствует §74 zákona č. 222/2004 Z.z. o DPH. Ставки DPH 2026: 23% / 19% / 5%. Лимит регистрации DPH: 50 000 € / 62 500 €.',
    disclaimer: 'Не является налоговой консультацией.',
    // Old CTA text, kept for reference only (not rendered).
    oldCta: 'Нужна помощь? — запишись на консультацию',
  },
};

function makeUiFormatter(locale) {
  const nf = new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'sk-SK', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return (n) => nf.format(n);
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════════

const defaultSeller = {
  name: '', street: '', city: '', zip: '', country: 'Slovenská republika',
  ico: '', dic: '', icDph: '', phone: '', email: '',
  bank: '', iban: '',
};

const defaultBuyer = {
  name: '', street: '', city: '', zip: '', country: '',
  ico: '', dic: '', icDph: '',
};

function makeItem() {
  return { id: Date.now(), desc: '', qty: 1, unit: 'ks', price: '', vatRate: 23 };
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

const FIELD_CLASS =
  'w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary';

function Field({ label, error, children }) {
  const id = useId();
  const child = isValidElement(children) ? cloneElement(children, { id }) : children;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1.5">{child}</div>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = '', ...rest }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${FIELD_CLASS} ${className}`}
      {...rest}
    />
  );
}

function Select({ value, onChange, options, className = '', ...rest }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${FIELD_CLASS} ${className}`}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Section({ title, open, onToggle, children }) {
  const panelId = useId();
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 text-left font-display text-sm font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-inset"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div id={panelId} className="px-5 sm:px-6 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function SecondaryButton({ className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${className}`}
      {...props}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function InvoiceGenerator({ locale = 'sk' }) {
  const t = STRINGS[locale] ?? STRINGS.sk;
  const fmtUi = makeUiFormatter(locale);
  const qrSwitchId = useId();

  // ── State ──
  const [seller, setSeller] = useState(() => {
    try { return { ...defaultSeller, ...JSON.parse(localStorage.getItem(STORAGE.SELLER)) }; }
    catch { return { ...defaultSeller }; }
  });
  const [logo, setLogo] = useState(() => localStorage.getItem(STORAGE.LOGO) || '');
  const [buyer, setBuyer] = useState({ ...defaultBuyer });
  const [clients, setClients] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE.CLIENTS)) || []; }
    catch { return []; }
  });
  const [invoiceNum, setInvoiceNum] = useState(() => nextInvoiceNumber());
  const [dateIssued, setDateIssued] = useState(today());
  const [dateDelivery, setDateDelivery] = useState(today());
  const [dateDue, setDateDue] = useState(() => addDays(today(), 14));
  const [paymentMethod, setPaymentMethod] = useState('prevod');
  const [ks, setKs] = useState('0308');
  const [lang, setLang] = useState('sk');
  const [isVatPayer, setIsVatPayer] = useState(false);
  const [items, setItems] = useState([makeItem()]);
  const [note, setNote] = useState('');
  const [enableQR, setEnableQR] = useState(true);
  const [qrPreviewUrl, setQrPreviewUrl] = useState(null);
  const [exemptReason, setExemptReason] = useState('');
  const [sections, setSections] = useState({ seller: true, buyer: true, params: false, vat: false, items: true, extra: false });
  const [savedMsg, setSavedMsg] = useState('');
  const fileInputRef = useRef(null);

  const vs = variabilnySymbol(invoiceNum);

  // ── Validation ──
  const ibanError = seller.iban && !validateIBAN(seller.iban) ? t.ibanError : '';
  const icoSellerError = seller.ico && !validateICO(seller.ico) ? t.icoError : '';
  const icoBuyerError = buyer.ico && !validateICO(buyer.ico) ? t.icoError : '';

  // ── Calculations ──
  const calculations = useMemo(() => {
    const lines = items.map((item) => {
      const base = calcLineTotal(item.qty, item.price);
      const rate = isVatPayer ? item.vatRate : 0;
      const vat = calcVatAmount(base, rate);
      return { ...item, base, vat, total: base + vat };
    });

    // Group by VAT rate
    const vatGroups = {};
    if (isVatPayer) {
      lines.forEach((l) => {
        const r = l.vatRate;
        if (!vatGroups[r]) vatGroups[r] = { base: 0, vat: 0 };
        vatGroups[r].base += l.base;
        vatGroups[r].vat += l.vat;
      });
    }

    const totalBase = lines.reduce((s, l) => s + l.base, 0);
    const totalVat = lines.reduce((s, l) => s + l.vat, 0);
    const totalDue = totalBase + totalVat;

    return { lines, vatGroups, totalBase, totalVat, totalDue };
  }, [items, isVatPayer]);

  // ── QR preview ──
  useEffect(() => {
    if (!enableQR || paymentMethod !== 'prevod' || !seller.iban || calculations.totalDue <= 0) {
      setQrPreviewUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { encode, PaymentOptions, CurrencyCode } = await import('bysquare/pay');
        const qrstring = encode({
          payments: [{
            type: PaymentOptions.PaymentOrder,
            amount: Math.round(calculations.totalDue * 100) / 100,
            currencyCode: CurrencyCode.EUR,
            variableSymbol: vs,
            constantSymbol: ks,
            beneficiary: { name: seller.name },
            bankAccounts: [{ iban: seller.iban.replace(/\s/g, '') }],
          }],
        });
        const url = await QRCode.toDataURL(qrstring, { width: 300, margin: 1 });
        if (!cancelled) setQrPreviewUrl(url);
      } catch {
        if (!cancelled) setQrPreviewUrl(null);
      }
    })();
    return () => { cancelled = true; };
  }, [enableQR, paymentMethod, seller.iban, seller.name, calculations.totalDue, vs, ks]);

  // ── Handlers ──
  const toggleSection = (key) => setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const updateSeller = (key, val) => setSeller((prev) => ({ ...prev, [key]: val }));
  const updateBuyer = (key, val) => setBuyer((prev) => ({ ...prev, [key]: val }));

  const saveSeller = () => {
    localStorage.setItem(STORAGE.SELLER, JSON.stringify(seller));
    if (logo) localStorage.setItem(STORAGE.LOGO, logo);
    else localStorage.removeItem(STORAGE.LOGO);
    setSavedMsg(t.saved);
    setTimeout(() => setSavedMsg(''), 2000);
  };

  const saveBuyerToClients = () => {
    if (!buyer.name) return;
    const exists = clients.find((c) => c.name === buyer.name);
    const updated = exists
      ? clients.map((c) => c.name === buyer.name ? { ...buyer } : c)
      : [...clients, { ...buyer }];
    setClients(updated);
    localStorage.setItem(STORAGE.CLIENTS, JSON.stringify(updated));
  };

  const selectClient = (name) => {
    const client = clients.find((c) => c.name === name);
    if (client) setBuyer({ ...defaultBuyer, ...client });
  };

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) { alert(t.logoTooBig); return; }
    const reader = new FileReader();
    reader.onload = () => { setLogo(reader.result); };
    reader.readAsDataURL(file);
  };

  const addItem = () => setItems((prev) => [...prev, makeItem()]);
  const removeItem = (id) => setItems((prev) => prev.length > 1 ? prev.filter((i) => i.id !== id) : prev);
  const updateItem = (id, key, val) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, [key]: val } : i));

  const setDueDays = (days) => setDateDue(addDays(dateIssued, days));

  // ── PDF generation ──
  const generatePDF = useCallback(async () => {
    // Lazy load fonts
    const { ROBOTO_REGULAR, ROBOTO_BOLD } = await import('@/fonts/roboto.js');

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto', 'normal');

    const W = 210;
    const M = 15;
    const CW = (W - M * 2 - 10) / 2;
    let y = M;
    const accent = [37, 99, 235]; // #2563EB

    const setN = (size = 9) => { doc.setFont('Roboto', 'normal'); doc.setFontSize(size); doc.setTextColor(60, 60, 60); };
    const setB = (size = 9) => { doc.setFont('Roboto', 'bold'); doc.setFontSize(size); doc.setTextColor(30, 30, 30); };
    const setA = (size = 9) => { doc.setFont('Roboto', 'bold'); doc.setFontSize(size); doc.setTextColor(...accent); };
    const setM = (size = 8) => { doc.setFont('Roboto', 'normal'); doc.setFontSize(size); doc.setTextColor(120, 120, 120); };
    const line = (x1, y1, x2, y2, color = [220, 220, 220]) => { doc.setDrawColor(...color); doc.setLineWidth(0.3); doc.line(x1, y1, x2, y2); };

    // ── Header ──
    if (logo) {
      try { doc.addImage(logo, 'PNG', M, y, 30, 15, undefined, 'FAST'); } catch { /* skip */ }
    }
    setA(20);
    doc.text(pdfT(lang, 'invoice'), W - M, y + 8, { align: 'right' });
    setN(10);
    doc.text(`${pdfT(lang, 'invoiceNo')}: ${invoiceNum}`, W - M, y + 14, { align: 'right' });
    y += 22;
    line(M, y, W - M, y, accent);
    y += 6;

    // ── Supplier & Buyer ──
    const drawParty = (x, title, data, showVat) => {
      let py = y;
      setA(8); doc.text(title, x, py); py += 5;
      setB(10); doc.text(data.name || '—', x, py); py += 5;
      setN(8);
      if (data.street) { doc.text(data.street, x, py); py += 4; }
      const cityLine = [data.zip, data.city].filter(Boolean).join(' ');
      if (cityLine) { doc.text(cityLine, x, py); py += 4; }
      if (data.country) { doc.text(data.country, x, py); py += 4; }
      py += 2;
      setM();
      if (data.ico) { doc.text(`${pdfT(lang, 'ico')}: ${data.ico}`, x, py); py += 3.5; }
      if (data.dic) { doc.text(`${pdfT(lang, 'dic')}: ${data.dic}`, x, py); py += 3.5; }
      if (showVat && data.icDph) { doc.text(`${pdfT(lang, 'icDph')}: ${data.icDph}`, x, py); py += 3.5; }
      if (data.phone) { doc.text(`${pdfT(lang, 'phone')}: ${data.phone}`, x, py); py += 3.5; }
      if (data.email) { doc.text(`${pdfT(lang, 'email')}: ${data.email}`, x, py); py += 3.5; }
      return py;
    };

    const y1 = drawParty(M, pdfT(lang, 'supplier'), seller, isVatPayer);
    const y2 = drawParty(M + CW + 10, pdfT(lang, 'buyer'), buyer, isVatPayer);
    y = Math.max(y1, y2) + 4;
    line(M, y, W - M, y);
    y += 5;

    // ── Dates & Payment ──
    const col3 = (W - M * 2) / 3;
    const drawField = (x, label, value, maxW) => {
      setM(7); doc.text(label, x, y);
      setN(9);
      const text = value || '—';
      const fitW = maxW || col3 - 4;
      const lines = doc.splitTextToSize(text, fitW);
      doc.text(lines[0], x, y + 4);
      if (lines.length > 1) {
        doc.setFontSize(7);
        doc.text(lines[1], x, y + 7.5);
      }
    };

    drawField(M, pdfT(lang, 'dateIssued'), dateIssued);
    drawField(M + col3, pdfT(lang, 'dateDelivery'), dateDelivery);
    drawField(M + col3 * 2, pdfT(lang, 'dateDue'), dateDue);
    y += 12;

    if (paymentMethod === 'prevod' && seller.iban) {
      drawField(M, pdfT(lang, 'iban'), seller.iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim());
      drawField(M + col3, pdfT(lang, 'vs'), vs);
      drawField(M + col3 * 2, pdfT(lang, 'paymentMethod'), pdfT(lang, 'bankTransfer'));
    } else {
      const pmLabels = { prevod: 'bankTransfer', hotovost: 'cash', karta: 'card' };
      drawField(M, pdfT(lang, 'paymentMethod'), pdfT(lang, pmLabels[paymentMethod]));
      if (vs) drawField(M + col3, pdfT(lang, 'vs'), vs);
    }
    y += 12;
    line(M, y, W - M, y);
    y += 6;

    // ── Items table ──
    const cols = isVatPayer
      ? [
          { label: pdfT(lang, 'no'), w: 8, align: 'center' },
          { label: pdfT(lang, 'description'), w: 62 },
          { label: pdfT(lang, 'qty'), w: 15, align: 'right' },
          { label: pdfT(lang, 'unit'), w: 12, align: 'center' },
          { label: pdfT(lang, 'unitPrice'), w: 22, align: 'right' },
          { label: pdfT(lang, 'vatRate'), w: 16, align: 'right' },
          { label: pdfT(lang, 'total'), w: 25, align: 'right' },
        ]
      : [
          { label: pdfT(lang, 'no'), w: 8, align: 'center' },
          { label: pdfT(lang, 'description'), w: 78 },
          { label: pdfT(lang, 'qty'), w: 18, align: 'right' },
          { label: pdfT(lang, 'unit'), w: 15, align: 'center' },
          { label: pdfT(lang, 'unitPrice'), w: 22, align: 'right' },
          { label: pdfT(lang, 'total'), w: 25, align: 'right' },
        ];

    // Header row
    doc.setFillColor(...accent);
    doc.rect(M, y - 3, W - M * 2, 7, 'F');
    doc.setFont('Roboto', 'bold'); doc.setFontSize(7); doc.setTextColor(255, 255, 255);
    let cx = M + 1;
    cols.forEach((col) => {
      const tx = col.align === 'right' ? cx + col.w - 2 : col.align === 'center' ? cx + col.w / 2 : cx + 1;
      doc.text(col.label, tx, y + 1, { align: col.align || 'left' });
      cx += col.w;
    });
    y += 7;

    // Data rows
    calculations.lines.forEach((item, idx) => {
      if (y > 265) { doc.addPage(); y = M; }
      if (idx % 2 === 0) {
        doc.setFillColor(248, 249, 252);
        doc.rect(M, y - 3, W - M * 2, 6, 'F');
      }
      setN(8);
      cx = M + 1;
      const vals = isVatPayer
        ? [String(idx + 1), item.desc || '', fmt(item.qty), item.unit, `${fmt(parseFloat(item.price) || 0)} €`, `${item.vatRate}%`, `${fmt(item.total)} €`]
        : [String(idx + 1), item.desc || '', fmt(item.qty), item.unit, `${fmt(parseFloat(item.price) || 0)} €`, `${fmt(item.base)} €`];

      vals.forEach((val, ci) => {
        const col = cols[ci];
        const tx = col.align === 'right' ? cx + col.w - 2 : col.align === 'center' ? cx + col.w / 2 : cx + 1;
        const lines = doc.splitTextToSize(val, col.w - 3);
        doc.text(lines[0] || '', tx, y, { align: col.align || 'left' });
        cx += col.w;
      });
      y += 6;
    });

    y += 2;
    line(M, y, W - M, y);
    y += 6;

    // ── QR code (left side) ──
    let qrImg = null;
    if (enableQR && paymentMethod === 'prevod' && seller.iban && calculations.totalDue > 0) {
      try {
        const { encode, PaymentOptions, CurrencyCode } = await import('bysquare/pay');
        const qrstring = encode({
          payments: [{
            type: PaymentOptions.PaymentOrder,
            amount: Math.round(calculations.totalDue * 100) / 100,
            currencyCode: CurrencyCode.EUR,
            variableSymbol: vs,
            constantSymbol: ks,
            beneficiary: { name: seller.name },
            bankAccounts: [{ iban: seller.iban.replace(/\s/g, '') }],
          }],
        });
        qrImg = await QRCode.toDataURL(qrstring, { width: 200, margin: 1 });
      } catch (err) {
        console.warn('QR generation failed:', err);
      }
    }

    // ── QR + Totals (side by side) ──
    const qrSize = 32;
    const totX = W - M - 65;
    const totW = 65;
    const sectionStartY = y;

    // Draw totals on the right
    let totY = sectionStartY;
    if (isVatPayer) {
      Object.entries(calculations.vatGroups).forEach(([rate, group]) => {
        setM(8);
        doc.text(`${pdfT(lang, 'subtotal')} (${rate}%)`, totX, totY);
        setN(9);
        doc.text(`${fmt(group.base)} €`, totX + totW, totY, { align: 'right' });
        totY += 4;
        setM(8);
        doc.text(`${pdfT(lang, 'vat')} (${rate}%)`, totX, totY);
        setN(9);
        doc.text(`${fmt(group.vat)} €`, totX + totW, totY, { align: 'right' });
        totY += 5;
      });
    } else {
      setM(8);
      doc.text(pdfT(lang, 'subtotal'), totX, totY);
      setN(9);
      doc.text(`${fmt(calculations.totalBase)} €`, totX + totW, totY, { align: 'right' });
      totY += 5;
    }

    line(totX, totY, totX + totW, totY, accent);
    totY += 5;
    setA(12);
    doc.text(pdfT(lang, 'totalDue'), totX, totY);
    doc.text(`${fmt(calculations.totalDue)} €`, totX + totW, totY, { align: 'right' });
    totY += 4;

    // Draw QR on the left with Pay by Square frame
    let qrBottomY = sectionStartY;
    if (qrImg) {
      const qrX = M;
      const qrY = sectionStartY - 3;
      const pad = 2;
      const frameW = qrSize + pad * 2;
      const frameH = qrSize + pad * 2 + 7;
      // Blue border
      doc.setDrawColor(91, 155, 213);
      doc.setLineWidth(0.6);
      doc.roundedRect(qrX - pad, qrY - pad, frameW, frameH, 2, 2, 'S');
      // QR image
      doc.addImage(qrImg, 'PNG', qrX, qrY, qrSize, qrSize);
      // "PAY by square" label
      const labelY = qrY + qrSize + 4;
      doc.setFont('Roboto', 'bold'); doc.setFontSize(6); doc.setTextColor(91, 155, 213);
      doc.text('PAY', qrX + frameW / 2 - 7, labelY);
      doc.setFont('Roboto', 'normal'); doc.setFontSize(6); doc.setTextColor(139, 139, 139);
      doc.text(' by square', qrX + frameW / 2 - 3, labelY);
      qrBottomY = qrY + frameH + 3;
    }

    // Advance y past whichever column is taller
    y = Math.max(totY, qrBottomY) + 6;

    // ── Not VAT payer note ──
    if (!isVatPayer) {
      setM(8);
      doc.text(pdfT(lang, 'notVatPayer'), M, y);
      y += 5;
    }

    // ── Exempt reason ──
    if (isVatPayer && exemptReason && items.some((i) => i.vatRate === 0)) {
      setM(8);
      doc.text(`Oslobodenie od DPH: ${exemptReason}`, M, y);
      y += 5;
    }

    // ── Note ──
    if (note) {
      y += 3;
      setM(7); doc.text(pdfT(lang, 'note') + ':', M, y); y += 4;
      setN(8);
      const noteLines = doc.splitTextToSize(note, W - M * 2);
      doc.text(noteLines, M, y);
      y += noteLines.length * 3.5;
    }

    // ── Footer line ──
    const footY = 282;
    line(M, footY - 3, W - M, footY - 3, [220, 220, 220]);
    setM(6);
    const footParts = [seller.name, seller.ico ? `IČO: ${seller.ico}` : '', seller.dic ? `DIČ: ${seller.dic}` : ''].filter(Boolean);
    if (isVatPayer && seller.icDph) footParts.push(`IČ DPH: ${seller.icDph}`);
    doc.text(footParts.join(' | '), W / 2, footY, { align: 'center' });

    // Save counter
    const numPart = parseInt(invoiceNum.slice(4), 10) || 0;
    localStorage.setItem(STORAGE.COUNTER, String(numPart));

    // Save buyer
    saveBuyerToClients();

    doc.save(`faktura-${invoiceNum}.pdf`);
  }, [seller, buyer, items, calculations, invoiceNum, dateIssued, dateDelivery, dateDue, paymentMethod, ks, vs, lang, isVatPayer, note, enableQR, exemptReason, logo]);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  const unitOptions = UNITS.map((u) => ({ value: u.value, label: t.units[u.value] ?? u.value }));
  const paymentOptions = PAYMENT_METHODS.map((m) => ({ value: m.value, label: t.payment[m.value] }));
  const langOptions = LANG_OPTIONS.map((o) => ({ value: o.value, label: t.langOptions[o.value] }));
  const vatSelectOptions = VAT_RATES.map((r) => ({ value: r.value, label: locale === 'en' ? `${r.value}%` : `${r.value} %` }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">

        {/* ═══ INPUTS ═══ */}
        <section className="rounded-xl border border-border bg-background divide-y divide-border overflow-hidden">

          {/* ═══ SECTION: Seller ═══ */}
          <Section title={t.sectionSeller} open={sections.seller} onToggle={() => toggleSection('seller')}>
            {/* Logo */}
            <div>
              <span className="text-sm font-medium">{t.logo}</span>
              <div className="flex items-center gap-3 mt-1.5">
                {logo ? (
                  <div className="relative">
                    <img src={logo} alt="Logo" className="h-10 rounded border border-border" />
                    <button
                      type="button"
                      onClick={() => setLogo('')}
                      aria-label={t.removeLogo}
                      className="absolute -top-1.5 -right-1.5 bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none"
                    >×</button>
                  </div>
                ) : (
                  <SecondaryButton onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5" /> {t.upload}
                  </SecondaryButton>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogo} aria-label={t.upload} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Field label={t.name}>
                  <Input value={seller.name} onChange={(v) => updateSeller('name', v)} placeholder={t.namePlaceholder} />
                </Field>
              </div>
              <Field label={t.street}><Input value={seller.street} onChange={(v) => updateSeller('street', v)} /></Field>
              <Field label={t.city}><Input value={seller.city} onChange={(v) => updateSeller('city', v)} /></Field>
              <Field label={t.zip}><Input value={seller.zip} onChange={(v) => updateSeller('zip', v)} /></Field>
              <Field label={t.country}><Input value={seller.country} onChange={(v) => updateSeller('country', v)} /></Field>
              <Field label={t.ico} error={icoSellerError}><Input value={seller.ico} onChange={(v) => updateSeller('ico', v)} placeholder="12345678" /></Field>
              <Field label={t.dic}><Input value={seller.dic} onChange={(v) => updateSeller('dic', v)} placeholder="1234567890" /></Field>
              {isVatPayer && (
                <Field label={t.icDph}><Input value={seller.icDph} onChange={(v) => updateSeller('icDph', v)} placeholder="SK1234567890" /></Field>
              )}
              <Field label={t.phone}><Input value={seller.phone} onChange={(v) => updateSeller('phone', v)} /></Field>
              <Field label={t.email}><Input value={seller.email} onChange={(v) => updateSeller('email', v)} type="email" /></Field>
              <Field label={t.bank}><Input value={seller.bank} onChange={(v) => updateSeller('bank', v)} /></Field>
              <div className="sm:col-span-2">
                <Field label={t.iban} error={ibanError}>
                  <Input value={seller.iban} onChange={(v) => updateSeller('iban', formatIBAN(v))} placeholder="SK89 0200 0000 0000 0000 0000" className="font-mono tabular-nums" />
                </Field>
              </div>
            </div>
          </Section>

          {/* ═══ SECTION: Buyer ═══ */}
          <Section title={t.sectionBuyer} open={sections.buyer} onToggle={() => toggleSection('buyer')}>
            {clients.length > 0 && (
              <Field label={t.pickSaved}>
                <Select
                  value=""
                  onChange={(v) => { if (v) selectClient(v); }}
                  options={[{ value: '', label: t.choose }, ...clients.map((c) => ({ value: c.name, label: c.name }))]}
                />
              </Field>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Field label={t.name}><Input value={buyer.name} onChange={(v) => updateBuyer('name', v)} /></Field>
              </div>
              <Field label={t.street}><Input value={buyer.street} onChange={(v) => updateBuyer('street', v)} /></Field>
              <Field label={t.city}><Input value={buyer.city} onChange={(v) => updateBuyer('city', v)} /></Field>
              <Field label={t.zip}><Input value={buyer.zip} onChange={(v) => updateBuyer('zip', v)} /></Field>
              <Field label={t.country}><Input value={buyer.country} onChange={(v) => updateBuyer('country', v)} /></Field>
              <Field label={t.ico} error={icoBuyerError}><Input value={buyer.ico} onChange={(v) => updateBuyer('ico', v)} /></Field>
              <Field label={t.dic}><Input value={buyer.dic} onChange={(v) => updateBuyer('dic', v)} /></Field>
              {isVatPayer && (
                <Field label={t.icDph}><Input value={buyer.icDph} onChange={(v) => updateBuyer('icDph', v)} /></Field>
              )}
            </div>
          </Section>

          {/* ═══ SECTION: Invoice params ═══ */}
          <Section title={t.sectionParams} open={sections.params} onToggle={() => toggleSection('params')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.invoiceNo}><Input value={invoiceNum} onChange={setInvoiceNum} className="font-mono tabular-nums" /></Field>
              <Field label={t.dateIssued}><Input type="date" value={dateIssued} onChange={(v) => { setDateIssued(v); setDateDue(addDays(v, 14)); }} /></Field>
              <Field label={t.dateDelivery}><Input type="date" value={dateDelivery} onChange={setDateDelivery} /></Field>
              <div>
                <Field label={t.dateDue}><Input type="date" value={dateDue} onChange={setDateDue} /></Field>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDueDays(d)}
                      className="text-xs px-2.5 py-1 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                    >{t.plusDays(d)}</button>
                  ))}
                </div>
              </div>
              <Field label={t.ks}>
                <Input value={ks} onChange={setKs} placeholder="0308" className="font-mono tabular-nums" />
              </Field>
              <Field label={t.paymentMethod}>
                <Select value={paymentMethod} onChange={setPaymentMethod} options={paymentOptions} />
              </Field>
              <Field label={t.invoiceLang}>
                <Select value={lang} onChange={setLang} options={langOptions} />
              </Field>
            </div>
          </Section>

          {/* ═══ SECTION: VAT mode ═══ */}
          <Section title={t.sectionVat} open={sections.vat} onToggle={() => toggleSection('vat')}>
            <div className="grid grid-cols-2 gap-2">
              {[
                [false, t.vatNo],
                [true, t.vatYes],
              ].map(([val, label]) => (
                <button
                  key={String(val)}
                  type="button"
                  aria-pressed={isVatPayer === val}
                  onClick={() => setIsVatPayer(val)}
                  className={`min-h-10 py-2 px-3 rounded-lg text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${isVatPayer === val ? 'bg-primary text-white border-primary' : 'bg-background border-border text-foreground hover:border-primary/40'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {!isVatPayer && (
              <p className="text-xs text-muted-foreground rounded-lg border border-border bg-muted p-3">
                {t.vatNote}
              </p>
            )}
            {isVatPayer && items.some((i) => i.vatRate === 0) && (
              <Field label={t.exemptReason}>
                <Input value={exemptReason} onChange={setExemptReason} placeholder={t.exemptPlaceholder} />
              </Field>
            )}
            {isVatPayer && (
              <div>
                <p className="text-xs font-medium">{t.vatRatesTitle}</p>
                <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                  {VAT_RATES.map((r) => (
                    <li key={r.value}>
                      <span className="font-medium text-foreground">{t.vat[r.value].label}</span>
                      {': '}{t.vat[r.value].desc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* ═══ SECTION: Items ═══ */}
          <Section title={t.sectionItems} open={sections.items} onToggle={() => toggleSection('items')}>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="rounded-xl border border-border bg-muted p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t.item} {idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={t.removeItem}
                        className="text-muted-foreground hover:text-red-700 transition-colors"
                      ><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                  <Field label={t.desc}>
                    <Input value={item.desc} onChange={(v) => updateItem(item.id, 'desc', v)} placeholder={t.descPlaceholder} />
                  </Field>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Field label={t.qty}><Input type="number" min="0" step="0.5" value={item.qty} onChange={(v) => updateItem(item.id, 'qty', v)} className="font-mono tabular-nums" /></Field>
                    <Field label={t.unit}><Select value={item.unit} onChange={(v) => updateItem(item.id, 'unit', v)} options={unitOptions} /></Field>
                    <Field label={t.priceNoVat}><Input type="number" min="0" step="0.01" value={item.price} onChange={(v) => updateItem(item.id, 'price', v)} className="font-mono tabular-nums" /></Field>
                    {isVatPayer ? (
                      <Field label={t.vatPct}>
                        <Select
                          value={item.vatRate}
                          onChange={(v) => updateItem(item.id, 'vatRate', parseInt(v, 10))}
                          options={vatSelectOptions}
                        />
                      </Field>
                    ) : (
                      <div className="flex items-end pb-2">
                        <span className="font-mono tabular-nums text-sm font-semibold">{fmtUi(calcLineTotal(item.qty, item.price))}</span>
                      </div>
                    )}
                  </div>
                  {isVatPayer && (
                    <div className="text-xs text-muted-foreground sm:text-right font-mono tabular-nums">
                      {t.lineNoVat}: {fmtUi(calcLineTotal(item.qty, item.price))} | {t.lineVat}: {fmtUi(calcVatAmount(calcLineTotal(item.qty, item.price), item.vatRate))} | <strong className="text-foreground">{t.lineTotal}: {fmtUi(calcLineTotal(item.qty, item.price) * (1 + item.vatRate / 100))}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <SecondaryButton onClick={addItem} className="w-full">
              <Plus className="h-4 w-4" /> {t.addItem}
            </SecondaryButton>
          </Section>

          {/* ═══ SECTION: Extra ═══ */}
          <Section title={t.sectionExtra} open={sections.extra} onToggle={() => toggleSection('extra')}>
            <Field label={t.note}>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary resize-none"
                placeholder={t.notePlaceholder}
              />
            </Field>
            <div className="flex items-center gap-3">
              <button
                id={qrSwitchId}
                type="button"
                role="switch"
                aria-checked={enableQR}
                onClick={() => setEnableQR(!enableQR)}
                className={`w-10 h-5 shrink-0 rounded-full transition-colors flex items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${enableQR ? 'bg-primary' : 'bg-border'}`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${enableQR ? 'translate-x-5' : ''}`} />
              </button>
              <label htmlFor={qrSwitchId} className="text-sm cursor-pointer">{t.qrToggle}</label>
            </div>
          </Section>
        </section>

        {/* ═══ SUMMARY ═══ */}
        <section className="rounded-xl border border-border bg-muted p-5 sm:p-6 lg:sticky lg:top-24 space-y-5">
          <div>
            <div className="text-sm text-muted-foreground">{t.totalDue}</div>
            <div className="font-mono tabular-nums text-3xl sm:text-4xl font-semibold mt-1 break-words">{fmtUi(calculations.totalDue)}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.invoiceNo}: <span className="font-mono tabular-nums">{invoiceNum}</span></div>
          </div>

          <div className="space-y-1.5 border-t border-border pt-4">
            {isVatPayer && Object.entries(calculations.vatGroups).map(([rate, group]) => (
              <div key={rate} className="space-y-1.5">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{t.baseLine(rate)}</span>
                  <span className="font-mono tabular-nums">{fmtUi(group.base)}</span>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{t.vatLineLabel(rate)}</span>
                  <span className="font-mono tabular-nums">{fmtUi(group.vat)}</span>
                </div>
              </div>
            ))}
            {!isVatPayer && (
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{t.amount}</span>
                <span className="font-mono tabular-nums">{fmtUi(calculations.totalBase)}</span>
              </div>
            )}
          </div>

          {/* QR PREVIEW */}
          {qrPreviewUrl ? (
            <div className="flex justify-center">
              <div className="inline-flex flex-col items-center rounded-xl border-2 border-[#5b9bd5] bg-white p-3">
                <img src={qrPreviewUrl} alt="Pay by Square QR" className="w-44 h-44" />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-bold" style={{ color: '#5b9bd5' }}>PAY</span>
                  <span className="text-sm" style={{ color: '#8b8b8b' }}>by square</span>
                  <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect x="0.5" y="0.5" width="17" height="13" rx="2" stroke="#5b9bd5" /><rect y="3" width="18" height="3" fill="#5b9bd5" /></svg>
                </div>
              </div>
            </div>
          ) : (
            enableQR && <p className="text-xs text-muted-foreground">{t.qrHint}</p>
          )}

          <div className="space-y-2">
            <button
              type="button"
              onClick={generatePDF}
              className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" /> {t.download}
            </button>
            <SecondaryButton onClick={saveSeller} className="w-full">
              <Save className="h-4 w-4" /> {t.save}
              {savedMsg && <span className="ml-1 text-muted-foreground">{savedMsg}</span>}
            </SecondaryButton>
          </div>
        </section>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
        <p>{t.footnote}</p>
        <p>{t.disclaimer}</p>
      </div>
    </div>
  );
}
