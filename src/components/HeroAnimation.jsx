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

const TIMINGS = { idle: 800, chaos: 2200, stamp: 700, hold: 1800, flyaway: 900, reset: 500 };

export default function HeroAnimation() {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    let timers = [];
    function runCycle() {
      setPhase('chaos');
      const t1 = TIMINGS.chaos;
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
    if (phase === 'idle' || phase === 'reset') return {
      transform: `translate(${doc.x}px, ${doc.y}px) rotate(${doc.rot}deg)`,
      opacity: 0,
      transition: 'all 0.4s ease-in-out',
    };
    if (phase === 'chaos') return {
      transform: `translate(${doc.x}px, ${doc.y}px) rotate(${doc.rot}deg)`,
      opacity: 1,
      transition: 'opacity 0.5s ease-in',
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
    <div className="relative w-full flex flex-col items-center justify-center" style={{ height: 440 }}>

      {/* MacBook lid */}
      <div style={{ position: 'relative', width: 390, perspective: 1000 }}>
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
              background: 'linear-gradient(135deg, #08080e 0%, #0a0a14 60%, #0d0818 100%)',
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
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{doc.label}</span>
                  </div>
                ))}
              </div>

              {/* EP. STAMP */}
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
                {/* Classic rubber stamp */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Stamp handle */}
                  <div style={{
                    width: 32, height: 14, borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(180deg, #1a3a8f 0%, #1e40af 100%)',
                    boxShadow: '0 -2px 6px rgba(37,99,235,0.4)',
                  }} />
                  {/* Stamp body */}
                  <div style={{
                    width: 96, height: 8,
                    background: 'linear-gradient(180deg, #1e40af 0%, #1d4ed8 100%)',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                  }} />
                  {/* Stamp face */}
                  <div style={{
                    width: 100,
                    padding: '8px 16px 10px',
                    border: '2.5px solid #2563EB',
                    borderRadius: 4,
                    background: 'rgba(37,99,235,0.08)',
                    position: 'relative',
                    boxShadow: phase === 'hold'
                      ? '0 0 0 2px rgba(37,99,235,0.2), 0 0 30px rgba(37,99,235,0.5), 0 0 60px rgba(37,99,235,0.2)'
                      : '0 0 15px rgba(37,99,235,0.3)',
                    transition: `box-shadow ${TIMINGS.stamp}ms ease-out`,
                  }}>
                    {/* Outer decorative border */}
                    <div style={{
                      position: 'absolute', inset: 3,
                      border: '1px solid rgba(37,99,235,0.5)',
                      borderRadius: 2,
                      pointerEvents: 'none',
                    }} />
                    {/* Main text */}
                    <div style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 900,
                      fontSize: 30,
                      color: '#2563EB',
                      letterSpacing: '-1px',
                      lineHeight: 1,
                      textAlign: 'center',
                      textShadow: '0 0 20px rgba(37,99,235,0.6)',
                      position: 'relative', zIndex: 1,
                    }}>
                      EP<span style={{ color: '#1d4ed8' }}>.</span>
                    </div>
                    {/* Sub-text */}
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 6,
                      color: 'rgba(37,99,235,0.7)',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      marginTop: 3,
                      textTransform: 'uppercase',
                    }}>
                      Bratislava · SK
                    </div>
                  </div>
                  {/* Ink splatter on impact */}
                  {stampVisible && (
                    <div style={{
                      position: 'absolute',
                      bottom: -8, left: '50%', transform: 'translateX(-50%)',
                      width: 120, height: 12,
                      background: 'radial-gradient(ellipse, rgba(37,99,235,0.25) 0%, transparent 70%)',
                      filter: 'blur(3px)',
                    }} />
                  )}
                </div>
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