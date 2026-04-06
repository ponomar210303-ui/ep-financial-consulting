import { useEffect, useState } from 'react';

const docs = [
  { id: 1, label: 'DPH', emoji: '📄', x: -80, y: -60, rot: -25, vx: -200, vy: -180 },
  { id: 2, label: 'Faktúra', emoji: '🧾', x: 60, y: -80, rot: 20, vx: 180, vy: -220 },
  { id: 3, label: 'Živnosť', emoji: '📋', x: -110, y: 20, rot: -40, vx: -250, vy: 100 },
  { id: 4, label: 'IČO', emoji: '📝', x: 100, y: 30, rot: 35, vx: 220, vy: 130 },
  { id: 5, label: 'Daň', emoji: '📃', x: -50, y: 70, rot: 15, vx: -150, vy: 200 },
  { id: 6, label: 'Zmluva', emoji: '📑', x: 40, y: 75, rot: -20, vx: 160, vy: 210 },
  { id: 7, label: 'DPH 2', emoji: '🗂️', x: -130, y: -20, rot: 50, vx: -280, vy: -80 },
  { id: 8, label: 'Report', emoji: '📊', x: 120, y: -30, rot: -45, vx: 260, vy: -90 },
];

// phases: 'idle' → 'chaos' (2s) → 'stamp' (0.6s) → 'flyaway' (0.8s) → 'hold' (1.5s) → reset
const PHASE_TIMINGS = {
  idle: 800,
  chaos: 2000,
  stamp: 600,
  hold: 1800,
  flyaway: 900,
  reset: 400,
};

export default function HeroAnimation() {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    let timers = [];
    function runCycle() {
      setPhase('chaos');
      timers.push(setTimeout(() => setPhase('stamp'), PHASE_TIMINGS.chaos));
      timers.push(setTimeout(() => setPhase('hold'), PHASE_TIMINGS.chaos + PHASE_TIMINGS.stamp));
      timers.push(setTimeout(() => setPhase('flyaway'), PHASE_TIMINGS.chaos + PHASE_TIMINGS.stamp + PHASE_TIMINGS.hold));
      timers.push(setTimeout(() => setPhase('reset'), PHASE_TIMINGS.chaos + PHASE_TIMINGS.stamp + PHASE_TIMINGS.hold + PHASE_TIMINGS.flyaway));
      timers.push(setTimeout(runCycle, PHASE_TIMINGS.chaos + PHASE_TIMINGS.stamp + PHASE_TIMINGS.hold + PHASE_TIMINGS.flyaway + PHASE_TIMINGS.reset + PHASE_TIMINGS.idle));
    }
    const init = setTimeout(runCycle, PHASE_TIMINGS.idle);
    return () => { clearTimeout(init); timers.forEach(clearTimeout); };
  }, []);

  const docStyle = (doc) => {
    const base = 'absolute flex flex-col items-center justify-center rounded-lg border text-center pointer-events-none select-none';
    let style = {};

    if (phase === 'idle' || phase === 'reset') {
      style = {
        transform: `translate(${doc.x}px, ${doc.y}px) rotate(${doc.rot}deg)`,
        opacity: 0,
        transition: 'all 0.4s ease-in-out',
      };
    } else if (phase === 'chaos') {
      style = {
        transform: `translate(${doc.x}px, ${doc.y}px) rotate(${doc.rot}deg)`,
        opacity: 1,
        transition: 'opacity 0.4s ease-in, transform 0.4s ease-out',
      };
    } else if (phase === 'stamp') {
      style = {
        transform: `translate(${doc.x * 0.3}px, ${doc.y * 0.3}px) rotate(${doc.rot * 0.3}deg) scale(0.85)`,
        opacity: 0.6,
        transition: `all ${PHASE_TIMINGS.stamp}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
      };
    } else if (phase === 'hold') {
      style = {
        transform: `translate(${doc.x * 0.3}px, ${doc.y * 0.3}px) rotate(${doc.rot * 0.3}deg) scale(0.85)`,
        opacity: 0.5,
        transition: 'none',
      };
    } else if (phase === 'flyaway') {
      style = {
        transform: `translate(${doc.vx}px, ${doc.vy}px) rotate(${doc.rot * 3}deg) scale(0.5)`,
        opacity: 0,
        transition: `all ${PHASE_TIMINGS.flyaway}ms cubic-bezier(0.55, 0, 1, 0.45)`,
      };
    }

    return { className: base, style };
  };

  const stampVisible = phase === 'stamp' || phase === 'hold';
  const stampFlyAway = phase === 'flyaway' || phase === 'reset' || phase === 'idle';

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: 420 }}>
      {/* MacBook body */}
      <div className="relative" style={{ width: 380, height: 260 }}>
        {/* Screen lid */}
        <div
          className="relative rounded-t-2xl overflow-hidden"
          style={{
            width: 380,
            height: 240,
            background: 'linear-gradient(135deg, #c8cacc 0%, #a8aaac 40%, #989a9c 100%)',
            padding: '3px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-lg z-10"
            style={{ background: 'linear-gradient(180deg, #a0a2a4, #888a8c)' }} />

          {/* Webcam dot */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#333] z-20"
            style={{ boxShadow: '0 0 4px rgba(0,200,255,0.4)' }} />

          {/* Screen */}
          <div
            className="w-full h-full rounded-t-xl overflow-hidden flex items-center justify-center relative"
            style={{ background: '#0A0A0F' }}
          >
            {/* Screen glow */}
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.15) 0%, transparent 70%)' }} />

            {/* Desktop wallpaper hint */}
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0a0a0f 50%, #2d1b69 100%)' }} />

            {/* Document cards */}
            <div className="absolute inset-0 flex items-center justify-center">
              {docs.map((doc) => {
                const { className, style } = docStyle(doc);
                return (
                  <div
                    key={doc.id}
                    className={className}
                    style={{
                      ...style,
                      width: 72,
                      height: 54,
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{doc.emoji}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', marginTop: 2 }}>
                      {doc.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* EP. Stamp */}
            <div
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{
                opacity: stampFlyAway ? 0 : stampVisible ? 1 : 0,
                transform: stampFlyAway
                  ? 'scale(3) translateY(-60px)'
                  : stampVisible
                    ? 'scale(1) translateY(0)'
                    : 'scale(3) translateY(-80px)',
                transition: phase === 'stamp'
                  ? `all ${PHASE_TIMINGS.stamp}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
                  : phase === 'flyaway'
                    ? `all ${PHASE_TIMINGS.flyaway * 0.5}ms ease-in`
                    : 'none',
              }}
            >
              <div
                style={{
                  padding: '10px 22px',
                  border: '3px solid #2563EB',
                  borderRadius: 8,
                  background: 'rgba(37,99,235,0.08)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: phase === 'hold'
                    ? '0 0 40px rgba(37,99,235,0.5), 0 0 80px rgba(37,99,235,0.2), inset 0 0 20px rgba(37,99,235,0.1)'
                    : '0 0 20px rgba(37,99,235,0.3)',
                  transition: `box-shadow ${PHASE_TIMINGS.stamp}ms ease-out`,
                }}
              >
                <span style={{
                  fontSize: 38,
                  fontWeight: 900,
                  fontFamily: 'Inter, sans-serif',
                  color: '#fff',
                  letterSpacing: '-1px',
                  lineHeight: 1,
                }}>
                  EP<span style={{ color: '#2563EB' }}>.</span>
                </span>
              </div>
            </div>

            {/* Stamp impact ripple */}
            {phase === 'stamp' && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: '2px solid rgba(37,99,235,0.6)',
                  animation: `ripple ${PHASE_TIMINGS.stamp}ms ease-out forwards`,
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Hinge */}
        <div style={{
          width: 380,
          height: 6,
          background: 'linear-gradient(180deg, #888a8c 0%, #a0a2a4 50%, #888a8c 100%)',
          borderRadius: '0 0 2px 2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }} />

        {/* Base/keyboard */}
        <div style={{
          width: 400,
          marginLeft: -10,
          height: 14,
          background: 'linear-gradient(180deg, #b0b2b4 0%, #989a9c 100%)',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }} />
      </div>

      {/* Ambient glow under laptop */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 h-8 rounded-full -z-10"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)', filter: 'blur(12px)' }} />

      {/* Background orbs */}
      <div className="absolute -z-10 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', top: '10%', right: '5%', filter: 'blur(60px)' }} />
      <div className="absolute -z-10 w-48 h-48 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', bottom: '10%', left: '10%', filter: 'blur(50px)' }} />

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}