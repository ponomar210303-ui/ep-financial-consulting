import { useEffect, useState } from 'react';

const docs = [
  { id: 1, label: 'DPH', emoji: '📄', x: -90, y: -55, rot: -28, vx: -220, vy: -190 },
  { id: 2, label: 'Faktúra', emoji: '🧾', x: 70, y: -75, rot: 22, vx: 200, vy: -230 },
  { id: 3, label: 'Živnosť', emoji: '📋', x: -100, y: 25, rot: -42, vx: -260, vy: 110 },
  { id: 4, label: 'IČO', emoji: '📝', x: 95, y: 35, rot: 38, vx: 240, vy: 140 },
  { id: 5, label: 'Daň', emoji: '📃', x: -55, y: 75, rot: 18, vx: -170, vy: 215 },
  { id: 6, label: 'Zmluva', emoji: '📑', x: 50, y: 72, rot: -22, vx: 180, vy: 220 },
  { id: 7, label: 'Odvody', emoji: '🗂️', x: -120, y: -15, rot: 52, vx: -290, vy: -70 },
  { id: 8, label: 'Report', emoji: '📊', x: 115, y: -25, rot: -48, vx: 270, vy: -80 },
];

const TIMINGS = { idle: 600, popin: 1800, stamp: 700, hold: 1800, flyaway: 900, reset: 500 };

export default function HeroAnimation() {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    let timers = [];
    function runCycle() {
      setPhase('popin');
      const t1 = TIMINGS.popin;
      const t2 = t1 + TIMINGS.stamp;
      const t3 = t2 + TIMINGS.hold;
      const t4 = t3 + TIMINGS.flyaway;
      const t5 = t4 + TIMINGS.reset + TIMINGS.idle;
      timers.push(setTimeout(() => setPhase('stamp'), t1));
      timers.push(setTimeout(() => setPhase('hold'), t2));
      timers.push(setTimeout(() => setPhase('flyaway'), t3));
      timers.push(setTimeout(() => setPhase('reset'), t4));
      timers.push(setTimeout(runCycle, t5));
    }
    const init = setTimeout(runCycle, TIMINGS.idle);
    return () => { clearTimeout(init); timers.forEach(clearTimeout); };
  }, []);

  const getDocStyle = (doc) => {
    const staggerDelay = (doc.id - 1) * 120;
    if (phase === 'idle' || phase === 'reset') return {
      transform: `translate(${doc.vx * 0.6}px, ${doc.vy * 0.6}px) rotate(${doc.rot * 2}deg) scale(0.4)`,
      opacity: 0,
      transition: 'all 0.4s ease-in',
    };
    if (phase === 'popin') return {
      transform: `translate(${doc.x}px, ${doc.y}px) rotate(${doc.rot}deg) scale(1)`,
      opacity: 1,
      transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay}ms`,
    };
    if (phase === 'stamp') return {
      transform: `translate(${doc.x * 0.25}px, ${doc.y * 0.25}px) rotate(${doc.rot * 0.3}deg) scale(0.8)`,
      opacity: 0.5,
      transition: `all ${TIMINGS.stamp}ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
    };
    if (phase === 'hold') return {
      transform: `translate(${doc.x * 0.25}px, ${doc.y * 0.25}px) rotate(${doc.rot * 0.3}deg) scale(0.8)`,
      opacity: 0.4,
      transition: 'none',
    };
    if (phase === 'flyaway') return {
      transform: `translate(${doc.vx}px, ${doc.vy}px) rotate(${doc.rot * 4}deg) scale(0.3)`,
      opacity: 0,
      transition: `all ${TIMINGS.flyaway}ms cubic-bezier(0.55, 0, 1, 0.45)`,
    };
    return {};
  };

  const stampVisible = phase === 'stamp' || phase === 'hold';
  const stampGone = phase === 'flyaway' || phase === 'reset' || phase === 'idle';

  return (
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: 510 }}>

      {/* MacBook lid */}
      <div style={{ position: 'relative', width: 390, perspective: 1000, transform: 'scale(1.15)', transformOrigin: 'top center', marginBottom: 26 }}>
        {/* Outer aluminum shell */}
        <div style={{
          width: 390,
          background: 'linear-gradient(160deg, #d4d6d8 0%, #b8bbbe 30%, #a8aaac 60%, #c0c2c4 100%)',
          borderRadius: '14px 14px 0 0',
          padding: '3px 3px 0 3px',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.5) inset, 0 30px 80px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {/* Apple-logo-area top center indent */}
          <div style={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            width: 28, height: 18, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)',
          }} />

          {/* Inner bezel (black) */}
          <div style={{
            background: '#111',
            borderRadius: '11px 11px 0 0',
            padding: '10px 10px 0 10px',
            position: 'relative',
          }}>
            {/* Webcam */}
            <div style={{
              position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#222', border: '1px solid #333', boxShadow: '0 0 3px rgba(0,180,255,0.3)' }} />
            </div>

            {/* Screen */}
            <div style={{
              width: '100%',
              height: 230,
              background: 'linear-gradient(135deg, #141420 0%, #181825 60%, #151320 100%)',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Screen reflection */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                borderRadius: '4px 4px 0 0',
                pointerEvents: 'none', zIndex: 30,
              }} />

              {/* Ambient glow */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)',
              }} />

              {/* Floating documents */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                {docs.map((doc) => (
                  <div key={doc.id} style={{
                    position: 'absolute',
                    width: 68, height: 50,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(3px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 2,
                    ...getDocStyle(doc),
                  }}>
                    <span style={{ fontSize: 16 }}>{doc.emoji}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: 'monospace', fontWeight: 600 }}>{doc.label}</span>
                  </div>
                ))}
              </div>

              {/* EP. ROUND SEAL STAMP */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 20,
                opacity: stampGone ? 0 : stampVisible ? 1 : 0,
                transform: stampGone
                  ? 'scale(2.5) translateY(-40px)'
                  : stampVisible ? 'scale(1) translateY(0)' : 'scale(2.5) translateY(-60px)',
                transition: phase === 'stamp'
                  ? `all ${TIMINGS.stamp}ms cubic-bezier(0.34, 1.36, 0.64, 1)`
                  : phase === 'flyaway'
                    ? `all ${TIMINGS.flyaway * 0.4}ms ease-in`
                    : 'none',
              }}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{
                  filter: phase === 'hold'
                    ? 'drop-shadow(0 0 14px rgba(59,130,246,0.8)) drop-shadow(0 0 36px rgba(59,130,246,0.4))'
                    : 'drop-shadow(0 0 7px rgba(59,130,246,0.5))',
                  transition: `filter ${TIMINGS.stamp}ms ease-out`,
                  opacity: 0.93,
                }}>
                  {/* Outer ring */}
                  <circle cx="80" cy="80" r="76" fill="none" stroke="#3B82F6" strokeWidth="3.5"/>
                  {/* Dashes ring */}
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3 5"/>
                  {/* Inner ring */}
                  <circle cx="80" cy="80" r="63" fill="none" stroke="#3B82F6" strokeWidth="2"/>

                  {/* Circular top text — r=67, arc=210px, text≈160px ✓ */}
                  <path id="topArc" d="M 80,80 m -67,0 a 67,67 0 1,1 134,0" fill="none"/>
                  <text fontSize="7.5" fontFamily="'Inter', sans-serif" fontWeight="800" fill="#3B82F6" letterSpacing="2">
                    <textPath href="#topArc" startOffset="8%">EVGENII PONOMAREV</textPath>
                  </text>

                  {/* Circular bottom text — r=67, arc=210px, text≈177px ✓ */}
                  <path id="bottomArc" d="M 80,80 m -67,0 a 67,67 0 0,0 134,0" fill="none"/>
                  <text fontSize="7" fontFamily="'Inter', sans-serif" fontWeight="700" fill="#3B82F6" letterSpacing="1.5">
                    <textPath href="#bottomArc" startOffset="10%">BRATISLAVA • SLOVAKIA</textPath>
                  </text>

                  {/* Center EP. text */}
                  <text x="80" y="75" textAnchor="middle" fontSize="30" fontFamily="'Inter', sans-serif" fontWeight="900" fill="#3B82F6" letterSpacing="-1">EP.</text>
                  {/* Center sub line */}
                  <line x1="56" y1="81" x2="104" y2="81" stroke="#3B82F6" strokeWidth="1" opacity="0.6"/>
                  {/* Center year */}
                  <text x="80" y="93" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="500" fill="#3B82F6" letterSpacing="2" opacity="0.8">2025</text>

                  {/* Star decorations at 12 and 6 o'clock */}
                  <text x="80" y="14" textAnchor="middle" fontSize="6" fill="#3B82F6">★</text>
                  <text x="80" y="150" textAnchor="middle" fontSize="6" fill="#3B82F6">★</text>
                </svg>

                {/* Ink bleed at bottom */}
                {stampVisible && (
                  <div style={{
                    position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                    width: 170, height: 10,
                    background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)',
                    filter: 'blur(4px)',
                  }} />
                )}
              </div>

              {/* Ripple on stamp */}
              {phase === 'stamp' && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 15, pointerEvents: 'none',
                }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      width: 60, height: 60, borderRadius: '50%',
                      border: '1.5px solid rgba(37,99,235,0.5)',
                      animation: `ripple ${TIMINGS.stamp * 0.8}ms ease-out ${i * 120}ms forwards`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom lip / hinge line */}
        <div style={{
          width: 390,
          height: 5,
          background: 'linear-gradient(180deg, #909294 0%, #b0b2b4 50%, #a0a2a4 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }} />

        {/* Keyboard base */}
        <div style={{
          width: 410, marginLeft: -10,
          height: 12,
          background: 'linear-gradient(180deg, #b8bbbe 0%, #a0a2a4 50%, #909294 100%)',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {/* Trackpad hint */}
          <div style={{
            position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
            width: 60, height: 4, borderRadius: 2,
            background: 'rgba(0,0,0,0.08)',
          }} />
        </div>
      </div>

      {/* Table reflection shadow */}
      <div style={{
        width: 350, height: 20, marginTop: 4,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)',
        filter: 'blur(8px)',
      }} />

      {/* Screen ambient glow on desk */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        width: 280, height: 30, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)',
        filter: 'blur(15px)',
        zIndex: -1,
      }} />

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}