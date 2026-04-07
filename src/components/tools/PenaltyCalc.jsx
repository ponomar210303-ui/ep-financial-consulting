import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CONSULTATION_URL } from '../../config/tools';

const situations = [
  {
    id: 'priznanie_late',
    label: 'Опоздал с daňové priznanie',
    desc: 'Срок — 31 марта (можно продлить до 30 июня). За каждый месяц просрочки — штраф.',
    calc: (months) => {
      const base = Math.max(5, months * 15);
      return {
        penalty: Math.min(base, 3000),
        note: `Штраф: €${Math.max(5, months * 15)} (мин €5, макс €3 000). Плюс пени за неуплату налога: ~${(months * 0.05).toFixed(2)}% от суммы в месяц.`,
      };
    },
    unit: 'месяцев просрочки',
    max: 36,
  },
  {
    id: 'dph_reg',
    label: 'Не зарегистрировался на DPH вовремя',
    desc: 'Обязан регистрироваться при обороте €49 790 за 12 мес. Штраф за незарегистрированный период.',
    calc: (months) => {
      const penalty = months * 100;
      return {
        penalty: Math.min(penalty, 20000),
        note: `Ориентировочный штраф: €${penalty} (€100/мес). Плюс обязанность доплатить DPH за весь нерегистрированный период.`,
      };
    },
    unit: 'месяцев без регистрации',
    max: 24,
  },
  {
    id: 'zivnost_late',
    label: 'Открыл živnosť после начала деятельности',
    desc: 'Работа без регистрации — административное нарушение.',
    calc: (months) => ({
      penalty: Math.min(months * 200, 3300),
      note: `Штраф: до €3 300. За ${months} мес. нарушения — ориентировочно €${Math.min(months * 200, 3300)}.`,
    }),
    unit: 'месяцев без регистрации',
    max: 12,
  },
  {
    id: 'socialna_late',
    label: 'Не платил в Sociálna poisťovňa',
    desc: 'Долг плюс штрафные проценты.',
    calc: (debt) => ({
      penalty: Math.round(debt * 0.05 * 12) / 12,
      note: `Пени: ~5% годовых от суммы долга. При долге €${debt} за год — €${(debt * 0.05).toFixed(0)} пеней. Плюс принудительное взыскание.`,
    }),
    unit: '€ суммы долга',
    max: 20000,
    isDebt: true,
  },
];

function fmt(n) {
  return new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function PenaltyCalc() {
  const [selected, setSelected] = useState(situations[0].id);
  const [value, setValue] = useState(3);

  const sit = situations.find((s) => s.id === selected);
  const result = sit.calc(value);

  return (
    <div className="space-y-5">
      {/* Situation selector */}
      <div className="space-y-2">
        {situations.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelected(s.id); setValue(s.isDebt ? 5000 : 3); }}
            className={`w-full text-left glass rounded-xl p-4 transition-all border ${selected === s.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-border/50 hover:border-amber-500/30'}`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${selected === s.id ? 'text-amber-500' : 'text-muted-foreground'}`} />
              <div>
                <div className={`font-semibold text-sm ${selected === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</div>
                {selected === s.id && <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-sm font-semibold">{sit.unit}</label>
          <span className="text-amber-500 font-bold">{sit.isDebt ? fmt(value) : value}</span>
        </div>
        <input
          type="range"
          min={sit.isDebt ? 500 : 1}
          max={sit.max}
          step={sit.isDebt ? 500 : 1}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          className="w-full accent-amber-500"
        />
      </div>

      {/* Result */}
      <div className="glass rounded-xl p-5 border-l-4 border-amber-500 space-y-3 bg-amber-500/5">
        <div>
          <div className="text-xs text-muted-foreground">Ориентировочный штраф</div>
          <div className="text-3xl font-black text-amber-500">{fmt(result.penalty)}</div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.note}</p>
      </div>

      <p className="text-xs text-muted-foreground text-center">Расчёт носит ознакомительный характер. Реальные штрафы зависят от обстоятельств. <a href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">Проконсультируйся со мной.</a></p>
    </div>
  );
}