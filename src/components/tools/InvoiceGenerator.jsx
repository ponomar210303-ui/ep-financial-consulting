'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Download, Save, Plus, Trash2, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { CONSULTATION_URL } from '../../config/tools';

// ═══════════════════════════════════════════════════════════════════
// 2026 SLOVAK INVOICE CONSTANTS
// Zdroj: §74 zákona č. 222/2004 Z.z. o DPH, finančná správa SR
// Dátum overenia: apríl 2026
// ═══════════════════════════════════════════════════════════════════

const VAT_RATES = [
  { value: 23, label: '23% (základná)', desc: 'Консалтинг, IT, переводы, маркетинг' },
  { value: 19, label: '19% (znížená)', desc: 'Электроэнергия, продукты, рестораны' },
  { value: 5,  label: '5% (znížená)', desc: 'Книги, лекарства, проживание' },
  { value: 0,  label: 'Oslobodené od DPH', desc: '§42 a nasl. zákona o DPH' },
];

const UNITS = [
  { value: 'ks', label: 'ks (шт.)' },
  { value: 'hod', label: 'hod (час)' },
  { value: 'služba', label: 'služba (услуга)' },
  { value: 'm', label: 'm (метр)' },
  { value: 'kg', label: 'kg (кг)' },
  { value: 'deň', label: 'deň (день)' },
  { value: 'mesiac', label: 'mesiac (месяц)' },
  { value: 'projekt', label: 'projekt' },
];

const PAYMENT_METHODS = [
  { value: 'prevod', label: 'Bankový prevod' },
  { value: 'hotovost', label: 'Hotovosť' },
  { value: 'karta', label: 'Platobná karta' },
];

const LANG_OPTIONS = [
  { value: 'sk', label: 'Slovenčina' },
  { value: 'ru', label: 'Русский' },
  { value: 'both', label: 'SK + RU' },
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

function t(lang, key) {
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

function Field({ label, error, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, className = '', ...rest }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-background/50 border border-border/50 rounded-lg h-9 px-3 text-sm focus:outline-none focus:border-primary/50 transition-colors ${className}`}
      {...rest}
    />
  );
}

function Select({ value, onChange, options, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-background/50 border border-border/50 rounded-lg h-9 px-2 text-sm focus:outline-none focus:border-primary/50 ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold hover:bg-card/50 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function InvoiceGenerator() {
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
  const ibanError = seller.iban && !validateIBAN(seller.iban) ? 'Nesprávny IBAN (napr. SK89 0200 ... alebo LT38 3250 ...)' : '';
  const icoSellerError = seller.ico && !validateICO(seller.ico) ? 'IČO: 8 číslic' : '';
  const icoBuyerError = buyer.ico && !validateICO(buyer.ico) ? 'IČO: 8 číslic' : '';

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
    setSavedMsg('Сохранено!');
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
    if (file.size > 500_000) { alert('Максимум 500 KB'); return; }
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
    doc.text(t(lang, 'invoice'), W - M, y + 8, { align: 'right' });
    setN(10);
    doc.text(`${t(lang, 'invoiceNo')}: ${invoiceNum}`, W - M, y + 14, { align: 'right' });
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
      if (data.ico) { doc.text(`${t(lang, 'ico')}: ${data.ico}`, x, py); py += 3.5; }
      if (data.dic) { doc.text(`${t(lang, 'dic')}: ${data.dic}`, x, py); py += 3.5; }
      if (showVat && data.icDph) { doc.text(`${t(lang, 'icDph')}: ${data.icDph}`, x, py); py += 3.5; }
      if (data.phone) { doc.text(`${t(lang, 'phone')}: ${data.phone}`, x, py); py += 3.5; }
      if (data.email) { doc.text(`${t(lang, 'email')}: ${data.email}`, x, py); py += 3.5; }
      return py;
    };

    const y1 = drawParty(M, t(lang, 'supplier'), seller, isVatPayer);
    const y2 = drawParty(M + CW + 10, t(lang, 'buyer'), buyer, isVatPayer);
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

    drawField(M, t(lang, 'dateIssued'), dateIssued);
    drawField(M + col3, t(lang, 'dateDelivery'), dateDelivery);
    drawField(M + col3 * 2, t(lang, 'dateDue'), dateDue);
    y += 12;

    if (paymentMethod === 'prevod' && seller.iban) {
      drawField(M, t(lang, 'iban'), seller.iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim());
      drawField(M + col3, t(lang, 'vs'), vs);
      drawField(M + col3 * 2, t(lang, 'paymentMethod'), t(lang, 'bankTransfer'));
    } else {
      const pmLabels = { prevod: 'bankTransfer', hotovost: 'cash', karta: 'card' };
      drawField(M, t(lang, 'paymentMethod'), t(lang, pmLabels[paymentMethod]));
      if (vs) drawField(M + col3, t(lang, 'vs'), vs);
    }
    y += 12;
    line(M, y, W - M, y);
    y += 6;

    // ── Items table ──
    const cols = isVatPayer
      ? [
          { label: t(lang, 'no'), w: 8, align: 'center' },
          { label: t(lang, 'description'), w: 62 },
          { label: t(lang, 'qty'), w: 15, align: 'right' },
          { label: t(lang, 'unit'), w: 12, align: 'center' },
          { label: t(lang, 'unitPrice'), w: 22, align: 'right' },
          { label: t(lang, 'vatRate'), w: 16, align: 'right' },
          { label: t(lang, 'total'), w: 25, align: 'right' },
        ]
      : [
          { label: t(lang, 'no'), w: 8, align: 'center' },
          { label: t(lang, 'description'), w: 78 },
          { label: t(lang, 'qty'), w: 18, align: 'right' },
          { label: t(lang, 'unit'), w: 15, align: 'center' },
          { label: t(lang, 'unitPrice'), w: 22, align: 'right' },
          { label: t(lang, 'total'), w: 25, align: 'right' },
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
        doc.text(`${t(lang, 'subtotal')} (${rate}%)`, totX, totY);
        setN(9);
        doc.text(`${fmt(group.base)} €`, totX + totW, totY, { align: 'right' });
        totY += 4;
        setM(8);
        doc.text(`${t(lang, 'vat')} (${rate}%)`, totX, totY);
        setN(9);
        doc.text(`${fmt(group.vat)} €`, totX + totW, totY, { align: 'right' });
        totY += 5;
      });
    } else {
      setM(8);
      doc.text(t(lang, 'subtotal'), totX, totY);
      setN(9);
      doc.text(`${fmt(calculations.totalBase)} €`, totX + totW, totY, { align: 'right' });
      totY += 5;
    }

    line(totX, totY, totX + totW, totY, accent);
    totY += 5;
    setA(12);
    doc.text(t(lang, 'totalDue'), totX, totY);
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
      doc.text(t(lang, 'notVatPayer'), M, y);
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
      setM(7); doc.text(t(lang, 'note') + ':', M, y); y += 4;
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

  return (
    <div className="space-y-4">

      {/* ═══ SECTION: Seller ═══ */}
      <Section title="1. Мои данные (dodávateľ)" open={sections.seller} onToggle={() => toggleSection('seller')}>
        {/* Logo */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">Логотип</label>
          <div className="flex items-center gap-3 mt-1">
            {logo ? (
              <div className="relative">
                <img src={logo} alt="Logo" className="h-10 rounded border border-border/30" />
                <button onClick={() => setLogo('')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">×</button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-card border border-border/50 text-muted-foreground hover:border-primary/40 transition-colors"
              >
                <Upload className="h-3 w-3" /> Загрузить
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={handleLogo} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <Field label="Название / ФИО *">
              <Input value={seller.name} onChange={(v) => updateSeller('name', v)} placeholder="EP. Financial Consulting" />
            </Field>
          </div>
          <Field label="Улица"><Input value={seller.street} onChange={(v) => updateSeller('street', v)} /></Field>
          <Field label="Город"><Input value={seller.city} onChange={(v) => updateSeller('city', v)} /></Field>
          <Field label="PSČ"><Input value={seller.zip} onChange={(v) => updateSeller('zip', v)} /></Field>
          <Field label="Страна"><Input value={seller.country} onChange={(v) => updateSeller('country', v)} /></Field>
          <Field label="IČO" error={icoSellerError}><Input value={seller.ico} onChange={(v) => updateSeller('ico', v)} placeholder="12345678" /></Field>
          <Field label="DIČ"><Input value={seller.dic} onChange={(v) => updateSeller('dic', v)} placeholder="1234567890" /></Field>
          {isVatPayer && (
            <Field label="IČ DPH"><Input value={seller.icDph} onChange={(v) => updateSeller('icDph', v)} placeholder="SK1234567890" /></Field>
          )}
          <Field label="Телефон"><Input value={seller.phone} onChange={(v) => updateSeller('phone', v)} /></Field>
          <Field label="E-mail"><Input value={seller.email} onChange={(v) => updateSeller('email', v)} type="email" /></Field>
          <Field label="Банк"><Input value={seller.bank} onChange={(v) => updateSeller('bank', v)} /></Field>
          <Field label="IBAN" error={ibanError}><Input value={seller.iban} onChange={(v) => updateSeller('iban', formatIBAN(v))} placeholder="SK89 0200 0000 0000 0000 0000" /></Field>
        </div>

        <button onClick={saveSeller} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Save className="h-3 w-3" /> Сохранить мои данные
          {savedMsg && <span className="ml-2 text-green-300">{savedMsg}</span>}
        </button>
      </Section>

      {/* ═══ SECTION: Buyer ═══ */}
      <Section title="2. Клиент (odberateľ)" open={sections.buyer} onToggle={() => toggleSection('buyer')}>
        {clients.length > 0 && (
          <Field label="Выбрать из сохранённых">
            <Select
              value=""
              onChange={(v) => { if (v) selectClient(v); }}
              options={[{ value: '', label: '— выберите —' }, ...clients.map((c) => ({ value: c.name, label: c.name }))]}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <Field label="Название / ФИО *"><Input value={buyer.name} onChange={(v) => updateBuyer('name', v)} /></Field>
          </div>
          <Field label="Улица"><Input value={buyer.street} onChange={(v) => updateBuyer('street', v)} /></Field>
          <Field label="Город"><Input value={buyer.city} onChange={(v) => updateBuyer('city', v)} /></Field>
          <Field label="PSČ"><Input value={buyer.zip} onChange={(v) => updateBuyer('zip', v)} /></Field>
          <Field label="Страна"><Input value={buyer.country} onChange={(v) => updateBuyer('country', v)} /></Field>
          <Field label="IČO" error={icoBuyerError}><Input value={buyer.ico} onChange={(v) => updateBuyer('ico', v)} /></Field>
          <Field label="DIČ"><Input value={buyer.dic} onChange={(v) => updateBuyer('dic', v)} /></Field>
          {isVatPayer && (
            <Field label="IČ DPH"><Input value={buyer.icDph} onChange={(v) => updateBuyer('icDph', v)} /></Field>
          )}
        </div>
      </Section>

      {/* ═══ SECTION: Invoice params ═══ */}
      <Section title="3. Параметры фактуры" open={sections.params} onToggle={() => toggleSection('params')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Číslo faktúry"><Input value={invoiceNum} onChange={setInvoiceNum} /></Field>
          <Field label="Dátum vystavenia"><Input type="date" value={dateIssued} onChange={(v) => { setDateIssued(v); setDateDue(addDays(v, 14)); }} /></Field>
          <Field label="Dátum dodania"><Input type="date" value={dateDelivery} onChange={setDateDelivery} /></Field>
          <div>
            <Field label="Dátum splatnosti"><Input type="date" value={dateDue} onChange={setDateDue} /></Field>
            <div className="flex gap-1 mt-1">
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setDueDays(d)} className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border/50 text-muted-foreground hover:border-primary/40">+{d} дн.</button>
              ))}
            </div>
          </div>
          <Field label="Konšt. symbol">
            <Input value={ks} onChange={setKs} placeholder="0308" />
          </Field>
          <Field label="Способ оплаты">
            <Select value={paymentMethod} onChange={setPaymentMethod} options={PAYMENT_METHODS} />
          </Field>
          <Field label="Язык фактуры">
            <Select value={lang} onChange={setLang} options={LANG_OPTIONS} />
          </Field>
        </div>
      </Section>

      {/* ═══ SECTION: VAT mode ═══ */}
      <Section title="4. Режим DPH" open={sections.vat} onToggle={() => toggleSection('vat')}>
        <div className="flex gap-2">
          {[
            [false, 'Не плательщик DPH'],
            [true, 'Плательщик DPH'],
          ].map(([val, label]) => (
            <button
              key={String(val)}
              onClick={() => setIsVatPayer(val)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${isVatPayer === val ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/40'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {!isVatPayer && (
          <p className="text-xs text-amber-500/80 bg-amber-500/10 rounded-lg p-2">
            На фактуре будет указано: «Nie sme platiteľmi DPH»
          </p>
        )}
        {isVatPayer && items.some((i) => i.vatRate === 0) && (
          <Field label="Основание освобождения от DPH">
            <Input value={exemptReason} onChange={setExemptReason} placeholder="§42 zákona č. 222/2004 Z.z." />
          </Field>
        )}
      </Section>

      {/* ═══ SECTION: Items ═══ */}
      <Section title="5. Позиции (položky)" open={sections.items} onToggle={() => toggleSection('items')}>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="glass rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
              <Field label="Описание">
                <Input value={item.desc} onChange={(v) => updateItem(item.id, 'desc', v)} placeholder="Konzultácia / Vývoj / Preklad..." />
              </Field>
              <div className="grid grid-cols-4 gap-2">
                <Field label="Кол-во"><Input type="number" min="0" step="0.5" value={item.qty} onChange={(v) => updateItem(item.id, 'qty', v)} /></Field>
                <Field label="Ед."><Select value={item.unit} onChange={(v) => updateItem(item.id, 'unit', v)} options={UNITS} /></Field>
                <Field label="Цена без DPH"><Input type="number" min="0" step="0.01" value={item.price} onChange={(v) => updateItem(item.id, 'price', v)} /></Field>
                {isVatPayer ? (
                  <Field label="DPH %">
                    <Select
                      value={item.vatRate}
                      onChange={(v) => updateItem(item.id, 'vatRate', parseInt(v, 10))}
                      options={VAT_RATES.map((r) => ({ value: r.value, label: `${r.value}%` }))}
                    />
                  </Field>
                ) : (
                  <div className="flex items-end pb-1">
                    <span className="text-sm font-bold text-primary">{fmt(calcLineTotal(item.qty, item.price))} €</span>
                  </div>
                )}
              </div>
              {isVatPayer && (
                <div className="text-xs text-muted-foreground text-right">
                  Без DPH: {fmt(calcLineTotal(item.qty, item.price))} € | DPH: {fmt(calcVatAmount(calcLineTotal(item.qty, item.price), item.vatRate))} € | <strong className="text-foreground">Итого: {fmt(calcLineTotal(item.qty, item.price) * (1 + item.vatRate / 100))} €</strong>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-card border border-border/50 text-muted-foreground hover:border-primary/40 transition-colors w-full justify-center">
          <Plus className="h-3.5 w-3.5" /> Добавить позицию
        </button>
      </Section>

      {/* ═══ SECTION: Extra ═══ */}
      <Section title="6. Дополнительно" open={sections.extra} onToggle={() => toggleSection('extra')}>
        <Field label="Poznámka / Примечание">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Ďakujeme za spoluprácu..."
          />
        </Field>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setEnableQR(!enableQR)}
            className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${enableQR ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${enableQR ? 'translate-x-5' : ''}`} />
          </div>
          <span className="text-xs">QR-код Pay by Square (для банковского перевода)</span>
        </label>
      </Section>

      {/* ═══ TOTALS ═══ */}
      <div className="glass rounded-xl p-4 space-y-2">
        {isVatPayer && Object.entries(calculations.vatGroups).map(([rate, group]) => (
          <div key={rate} className="flex justify-between text-xs text-muted-foreground">
            <span>Základ dane ({rate}%): {fmt(group.base)} € | DPH: {fmt(group.vat)} €</span>
          </div>
        ))}
        {!isVatPayer && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Сумма</span>
            <span className="font-semibold">{fmt(calculations.totalBase)} €</span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-2 border-t border-border/30">
          <span className="text-sm font-bold">{t(lang, 'totalDue')}</span>
          <span className="text-2xl font-black text-primary">{fmt(calculations.totalDue)} €</span>
        </div>
      </div>

      {/* ═══ QR PREVIEW ═══ */}
      {qrPreviewUrl && (
        <div className="flex justify-center">
          <div className="inline-flex flex-col items-center rounded-xl border-2 border-[#5b9bd5] bg-white p-3 shadow-sm">
            <img src={qrPreviewUrl} alt="Pay by Square QR" className="w-44 h-44" />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold" style={{ color: '#5b9bd5' }}>PAY</span>
              <span className="text-sm" style={{ color: '#8b8b8b' }}>by square</span>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><rect x="0.5" y="0.5" width="17" height="13" rx="2" stroke="#5b9bd5" /><rect y="3" width="18" height="3" fill="#5b9bd5" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DOWNLOAD BUTTON ═══ */}
      <button
        onClick={generatePDF}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Download className="h-4 w-4" /> Скачать PDF
      </button>

      <p className="text-[10px] text-muted-foreground/50 leading-relaxed text-center">
        Фактура соответствует §74 zákona č. 222/2004 Z.z. o DPH. Ставки DPH 2026: 23% / 19% / 5%.
        Лимит регистрации DPH: 50 000 € / 62 500 €.
        {' '}Нужна помощь? —{' '}
        <a href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">запишись на консультацию</a>.
      </p>
    </div>
  );
}
