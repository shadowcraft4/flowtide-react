// Canvas effect layer drawn over the vibe's scene: rain, petals, snow, sparkles,
// embers and drifting dust. The vibe picks the effect and its colours; the user
// only sets how much of it there is.

const MAX = { rain: 130, petals: 36, snow: 110, sparkles: 36, embers: 55, motes: 55, none: 0 };

const rnd = (a, b) => a + Math.random() * (b - a);

export function createParticleEngine(canvas) {
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, parts = [], kind = 'none', colors = ['#ffffff'], amount = 0.55;
  let alpha = 1, pending = null, raf = null;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fit();
    if (reduced) draw(0);
  }

  function spawn(k, anywhere) {
    const c = colors[Math.floor(Math.random() * colors.length)];
    const y = anywhere ? rnd(0, H) : null;
    switch (k) {
      case 'rain': return { x: rnd(-50, W), y: y ?? rnd(-H * 0.3, -10), vy: rnd(9, 15), len: rnd(10, 22), a: rnd(0.2, 0.5), c };
      case 'petals': return { x: rnd(0, W), y: y ?? -20, vy: rnd(0.5, 1.3), sw: rnd(0.6, 1.6), ph: rnd(0, 6), rot: rnd(0, 6), vr: rnd(-0.03, 0.03), s: rnd(5, 9), a: rnd(0.7, 1), c };
      case 'snow': return { x: rnd(0, W), y: y ?? -8, vy: rnd(0.4, 1.4), sw: rnd(0.3, 1), ph: rnd(0, 6), r: rnd(1, 3), a: rnd(0.5, 0.95), c: '#ffffff' };
      case 'sparkles': return { x: rnd(0, W), y: rnd(0, H), life: anywhere ? rnd(0, 1) : 0, sp: rnd(0.004, 0.01), s: rnd(4, 10), c };
      case 'embers': return { x: rnd(0, W * 0.5), y: y ?? H + 10, vy: rnd(-0.4, -1.1), sw: rnd(0.3, 0.9), ph: rnd(0, 6), r: rnd(1, 2.6), a: rnd(0.5, 1), c };
      default: return { x: rnd(0, W), y: y ?? H + 10, vy: rnd(-0.15, -0.45), sw: rnd(0.2, 0.5), ph: rnd(0, 6), r: rnd(1, 3.2), a: rnd(0.3, 0.7), c };
    }
  }

  function fit() {
    const n = Math.round((MAX[kind] || 0) * amount * (W / 900 + 0.2));
    while (parts.length < n) parts.push(spawn(kind, true));
    if (parts.length > n) parts.length = n;
  }

  function star(x, y, s) {
    ctx.beginPath(); ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      ctx.fillStyle = ctx.strokeStyle = p.c;
      switch (kind) {
        case 'rain':
          ctx.globalAlpha = p.a * alpha; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.len * 0.25, p.y - p.len); ctx.stroke();
          if (!reduced) { p.y += p.vy; p.x += p.vy * 0.25; if (p.y > H + 20) parts[i] = spawn('rain'); }
          break;
        case 'petals':
          ctx.globalAlpha = p.a * alpha; ctx.save();
          ctx.translate(p.x + Math.sin(t / 900 + p.ph) * 18 * p.sw, p.y); ctx.rotate(p.rot);
          ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 7); ctx.fill(); ctx.restore();
          if (!reduced) { p.y += p.vy; p.rot += p.vr; p.x -= 0.35; if (p.y > H + 20) parts[i] = spawn('petals'); }
          break;
        case 'snow':
          ctx.globalAlpha = p.a * alpha;
          ctx.beginPath(); ctx.arc(p.x + Math.sin(t / 1200 + p.ph) * 10 * p.sw, p.y, p.r, 0, 7); ctx.fill();
          if (!reduced) { p.y += p.vy; if (p.y > H + 10) parts[i] = spawn('snow'); }
          break;
        case 'sparkles': {
          const k = reduced ? 0.8 : Math.sin(p.life * Math.PI);
          ctx.globalAlpha = k * alpha; star(p.x, p.y, p.s * k);
          if (!reduced) { p.life += p.sp; if (p.life >= 1) parts[i] = spawn('sparkles'); }
          break;
        }
        case 'embers':
          ctx.globalAlpha = p.a * alpha * (0.6 + 0.4 * Math.sin(t / 120 + p.ph));
          ctx.shadowBlur = 8; ctx.shadowColor = p.c;
          ctx.beginPath(); ctx.arc(p.x + Math.sin(t / 700 + p.ph) * 12 * p.sw, p.y, p.r, 0, 7); ctx.fill();
          ctx.shadowBlur = 0;
          if (!reduced) { p.y += p.vy; if (p.y < -10) parts[i] = spawn('embers'); }
          break;
        default:
          ctx.globalAlpha = p.a * alpha;
          ctx.beginPath(); ctx.arc(p.x + Math.sin(t / 1600 + p.ph) * 14 * p.sw, p.y, p.r, 0, 7); ctx.fill();
          if (!reduced) { p.y += p.vy; if (p.y < -10) parts[i] = spawn('motes'); }
      }
    }
    ctx.globalAlpha = 1;
  }

  let last = 0;
  function loop(t) {
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (!document.hidden) {
      // A new vibe fades the old effect out before the new one fades in.
      if (pending) {
        alpha -= dt * 2.5;
        if (alpha <= 0) { ({ kind, colors } = pending); pending = null; parts = []; fit(); alpha = 0; }
      } else if (alpha < 1) alpha = Math.min(1, alpha + dt * 1.5);
      draw(t);
    }
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();

  return {
    start(next) {
      const first = kind === 'none' && !parts.length && !raf;
      if (reduced || first) {
        kind = next.kind; colors = next.colors; amount = next.amount;
        parts = []; fit(); alpha = 1; draw(0);
        if (!reduced && !raf) raf = requestAnimationFrame(loop);
        return;
      }
      amount = next.amount;
      if (next.kind === kind && !pending) {
        colors = next.colors; parts = []; fit();
      } else {
        pending = { kind: next.kind, colors: next.colors };
      }
    },
    setAmount(a) { amount = a; fit(); if (reduced) draw(0); },
    destroy() {
      cancelAnimationFrame(raf); raf = null;
      window.removeEventListener('resize', resize);
    },
  };
}
