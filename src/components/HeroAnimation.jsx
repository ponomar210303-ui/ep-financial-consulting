import { useEffect, useState } from 'react';

const documents = [
  { id: 1, label: 'DPH', color: 'from-primary/30 to-primary/10' },
  { id: 2, label: 'Živnosť', color: 'from-secondary/30 to-secondary/10' },
  { id: 3, label: 'IČO', color: 'from-primary/20 to-secondary/20' },
  { id: 4, label: 'Faktúra', color: 'from-secondary/20 to-primary/20' },
  { id: 5, label: 'Daň', color: 'from-primary/30 to-primary/10' },
  { id: 6, label: 'Zmluva', color: 'from-secondary/30 to-secondary/10' },
];

export default function HeroAnimation() {
  const [phase, setPhase] = useState('chaos');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('stamp'), 2500);
    const timer2 = setTimeout(() => setPhase('ordered'), 3300);
    const timer3 = setTimeout(() => setPhase('chaos'), 7000);

    const interval = setInterval(() => {
      setPhase('chaos');
      setTimeout(() => setPhase('stamp'), 2500);
      setTimeout(() => setPhase('ordered'), 3300);
    }, 7000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center">
      {/* Laptop frame */}
      <div className="relative w-[320px] h-[220px] lg:w-[400px] lg:h-[280px] rounded-2xl glass border-2 border-border/30 overflow-hidden">
        {/* Screen content */}
        <div className="absolute inset-2 rounded-xl bg-background/50 overflow-hidden">
          {/* Floating documents */}
          {documents.map((doc, i) => {
            const chaosStyles = {
              transform: phase === 'chaos'
                ? `translate(${(i % 3 - 1) * 60}px, ${(i % 2 === 0 ? -1 : 1) * (30 + i * 10)}px) rotate(${(i - 3) * 15}deg)`
                : 'translate(0, 0) rotate(0deg)',
              opacity: phase === 'chaos' ? 0.8 : 1,
              transition: `all ${0.5 + i * 0.1}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
            };

            const orderedY = phase === 'ordered' ? `${i * 2 - 5}px` : '0px';

            return (
              <div
                key={doc.id}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 lg:w-32 h-8 lg:h-10 rounded-lg bg-gradient-to-r ${doc.color} backdrop-blur-sm border border-border/30 flex items-center justify-center`}
                style={{
                  ...chaosStyles,
                  ...(phase === 'ordered' && {
                    transform: `translate(0, ${orderedY}) rotate(0deg)`,
                  }),
                  zIndex: phase === 'ordered' ? documents.length - i : i,
                }}
              >
                <span className="text-[10px] lg:text-xs font-mono font-medium text-foreground/70">
                  {doc.label}
                </span>
              </div>
            );
          })}

          {/* EP. Stamp */}
          {(phase === 'stamp' || phase === 'ordered') && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className={`${phase === 'stamp' ? 'animate-stamp' : ''} text-4xl lg:text-5xl font-black font-inter`}>
                EP<span className="text-primary">.</span>
              </div>
            </div>
          )}
        </div>

        {/* Laptop base reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      {/* Laptop stand */}
      <div className="absolute bottom-[60px] lg:bottom-[40px] w-[180px] lg:w-[220px] h-3 bg-gradient-to-b from-border/40 to-transparent rounded-b-xl" />

      {/* Ambient glow */}
      <div className="absolute -z-10 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute -z-10 w-48 h-48 bg-secondary/10 rounded-full blur-[80px] translate-x-20 translate-y-10" />
    </div>
  );
}