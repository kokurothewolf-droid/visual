// components/confetti.jsx — lightweight canvas confetti burst
//
// Self-contained, no dependencies. Mount <Confetti fire={true} /> and it
// rains a gentle, sensory-friendly burst once, then idles. Colors are drawn
// from the app's category palette so it stays on-brand and calm rather than
// a harsh primary-color explosion.

function Confetti({ fire, duration = 2600, count = 90 }) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const startRef = React.useRef(0);

  React.useEffect(() => {
    if (!fire) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Soft, on-brand palette
    const colors = ['#6F926F', '#7B9DB3', '#B68A56', '#9783B0', '#B97A6F', '#E4ECDE', '#F0E4D1'];

    // Spawn two gentle fountains from the lower corners + a center puff.
    const parts = [];
    const origins = [
      { x: W() * 0.5, y: H() * 0.32, spread: 1.0 },
    ];
    for (let i = 0; i < count; i++) {
      const o = origins[i % origins.length];
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 6 + Math.random() * 9;
      parts.push({
        x: o.x, y: o.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.3,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() < 0.5 ? 'rect' : 'circle',
        wobble: Math.random() * Math.PI * 2,
      });
    }

    startRef.current = performance.now();
    const tick = (now) => {
      const t = now - startRef.current;
      ctx.clearRect(0, 0, W(), H());
      const fade = Math.max(0, 1 - Math.max(0, t - (duration - 800)) / 800);

      for (const p of parts) {
        p.vy += 0.22;            // gravity
        p.vx *= 0.992;           // drag
        p.wobble += 0.1;
        p.x += p.vx + Math.sin(p.wobble) * 0.6;
        p.y += p.vy;
        p.rot += p.vrot;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (t < duration) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W(), H());
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      ctx && ctx.clearRect(0, 0, W(), H());
    };
  }, [fire, duration, count]);

  if (!fire) return null;
  return (
    <canvas ref={canvasRef}
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0, zIndex: 1500,
              pointerEvents: 'none',
            }} />
  );
}

Object.assign(window, { Confetti });
