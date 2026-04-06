import { useState, useEffect } from 'react';
import { Download, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';

const STORAGE_KEY = 'ep-invoice-seller';

const defaultSeller = { name: '', address: '', ico: '', dic: '', iban: '' };
const defaultBuyer = { name: '', address: '', ico: '' };
const defaultInvoice = { number: '', date: new Date().toISOString().slice(0, 10), dueDate: '', service: '', amount: '', dph: false, dphRate: 20, currency: 'EUR' };

export default function InvoiceGenerator() {
  const [seller, setSeller] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultSeller; } catch { return defaultSeller; }
  });
  const [buyer, setBuyer] = useState(defaultBuyer);
  const [invoice, setInvoice] = useState(defaultInvoice);
  const [saved, setSaved] = useState(false);

  const saveSeller = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seller));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const total = invoice.dph
    ? (+invoice.amount * (1 + invoice.dphRate / 100)).toFixed(2)
    : (+invoice.amount || 0).toFixed(2);
  const dphAmount = invoice.dph ? (+invoice.amount * invoice.dphRate / 100).toFixed(2) : '0.00';

  const generatePDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    let y = 20;

    // Header
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('FAKTÚRA', pageW / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`Číslo: ${invoice.number || 'FA-001'}`, pageW / 2, y, { align: 'center' });
    y += 15;

    // Seller / Buyer columns
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Dodávateľ (predávajúci):', 15, y);
    doc.text('Odberateľ (kupujúci):', 110, y);
    y += 6;
    doc.setFont('helvetica', 'normal');

    const sellerLines = [seller.name, seller.address, seller.ico ? `IČO: ${seller.ico}` : '', seller.dic ? `DIČ: ${seller.dic}` : '', seller.iban ? `IBAN: ${seller.iban}` : ''].filter(Boolean);
    const buyerLines = [buyer.name, buyer.address, buyer.ico ? `IČO: ${buyer.ico}` : ''].filter(Boolean);

    const maxLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (sellerLines[i]) doc.text(sellerLines[i], 15, y);
      if (buyerLines[i]) doc.text(buyerLines[i], 110, y);
      y += 5;
    }
    y += 8;

    // Dates
    doc.setFont('helvetica', 'bold');
    doc.text('Dátum vystavenia:', 15, y); doc.setFont('helvetica', 'normal'); doc.text(invoice.date, 70, y);
    y += 6;
    if (invoice.dueDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('Dátum splatnosti:', 15, y); doc.setFont('helvetica', 'normal'); doc.text(invoice.dueDate, 70, y);
      y += 6;
    }
    y += 6;

    // Services table
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('Popis tovaru/služby', 18, y + 5.5);
    doc.text('Cena bez DPH', 120, y + 5.5);
    doc.text('DPH', 155, y + 5.5);
    doc.text('Cena s DPH', 175, y + 5.5);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.service || '-', 18, y + 5.5);
    doc.text(`${invoice.amount || '0'} ${invoice.currency}`, 120, y + 5.5);
    doc.text(invoice.dph ? `${invoice.dphRate}%` : '0%', 155, y + 5.5);
    doc.text(`${total} ${invoice.currency}`, 175, y + 5.5);
    y += 12;

    // Total
    doc.setDrawColor(200, 200, 200); doc.line(15, y, pageW - 15, y);
    y += 7;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(`Suma na úhradu: ${total} ${invoice.currency}`, pageW - 15, y, { align: 'right' });
    y += 14;

    // Payment
    if (seller.iban) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.text(`Platba na účet: ${seller.iban}`, 15, y);
      y += 6;
    }

    // Footer note
    doc.setFontSize(8); doc.setTextColor(150);
    doc.text('Táto faktúra bola vystavená v súlade so zákonom č. 222/2004 Z.z. o dani z pridanej hodnoty.', 15, 280);

    doc.save(`faktura-${invoice.number || 'FA-001'}.pdf`);
  };

  const field = (label, val, set, placeholder = '', type = 'text') => (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        type={type} value={val} placeholder={placeholder}
        onChange={(e) => set(e.target.value)}
        className="w-full h-9 px-3 rounded-lg bg-background border border-border/50 text-sm focus:outline-none focus:border-primary/50"
      />
    </div>
  );

  return (
    <div className="space-y-6 text-sm">
      {/* Seller */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold">Продавец (Dodávateľ)</h4>
          <button onClick={saveSeller} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Save className="h-3 w-3" /> {saved ? 'Сохранено!' : 'Сохранить'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Имя / Название', seller.name, (v) => setSeller({ ...seller, name: v }), 'Ján Novák')}
          {field('Адрес', seller.address, (v) => setSeller({ ...seller, address: v }), 'Bratislava, Slovakia')}
          {field('IČO', seller.ico, (v) => setSeller({ ...seller, ico: v }), '12345678')}
          {field('DIČ', seller.dic, (v) => setSeller({ ...seller, dic: v }), 'SK1234567890')}
          <div className="col-span-2">
            {field('IBAN', seller.iban, (v) => setSeller({ ...seller, iban: v }), 'SK...')}
          </div>
        </div>
      </div>

      {/* Buyer */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h4 className="font-bold">Покупатель (Odberateľ)</h4>
        <div className="grid grid-cols-2 gap-3">
          {field('Имя / Название', buyer.name, (v) => setBuyer({ ...buyer, name: v }), 'Firma s.r.o.')}
          {field('Адрес', buyer.address, (v) => setBuyer({ ...buyer, address: v }), 'Košice, Slovakia')}
          {field('IČO', buyer.ico, (v) => setBuyer({ ...buyer, ico: v }), '87654321')}
        </div>
      </div>

      {/* Invoice details */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h4 className="font-bold">Фактура</h4>
        <div className="grid grid-cols-2 gap-3">
          {field('Номер фактуры', invoice.number, (v) => setInvoice({ ...invoice, number: v }), 'FA-2025-001')}
          {field('Дата выставления', invoice.date, (v) => setInvoice({ ...invoice, date: v }), '', 'date')}
          {field('Срок оплаты', invoice.dueDate, (v) => setInvoice({ ...invoice, dueDate: v }), '', 'date')}
          {field('Услуга / Товар', invoice.service, (v) => setInvoice({ ...invoice, service: v }), 'Vývoj softvéru')}
          {field('Сумма (без DPH)', invoice.amount, (v) => setInvoice({ ...invoice, amount: v }), '1000', 'number')}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setInvoice({ ...invoice, dph: !invoice.dph })}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${invoice.dph ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${invoice.dph ? 'translate-x-4' : ''}`} />
          </div>
          <span>Плательщик DPH ({invoice.dphRate}%)</span>
        </label>
        {invoice.dph && (
          <div className="flex gap-2 text-sm">
            <span className="text-muted-foreground">DPH: <strong>{dphAmount} EUR</strong></span>
            <span className="text-muted-foreground ml-4">Итого: <strong className="text-foreground">{total} EUR</strong></span>
          </div>
        )}
      </div>

      <button
        onClick={generatePDF}
        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-semibold transition-colors"
      >
        <Download className="h-4 w-4" />
        Скачать PDF
      </button>
    </div>
  );
}