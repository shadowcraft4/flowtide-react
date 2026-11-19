// Canvas particle layer: snow, rain, fireflies, bokeh, bubbles, drifting motes.

const COUNTS = { motes: 36, fireflies: 22, bokeh: 16, none: 0, bubbles: 24, snow: 90, rain: 140 };

function rand(a, b) { return a + Math.random() * (b - a); }
function hexToRgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function createParticleEngine(canvas) {
  const ctx = canvas.getContext('2d');
  let items = [], type = 'motes', raf = null, w = 0, h = 0, lastT = 0;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function make(t) {
    const x = rand(0, w), y = rand(0, h);
    if (t === 'snow') return { x, y, r: rand(1.5, 3.5), vy: rand(14, 34), vx: rand(-6, 6), sway: rand(0, Math.PI * 2), swaySpeed: rand(.5, 1.3), o: rand(.4, .9) };
    if (t === 'rain') return { x, y, len: rand(10, 22), vy: rand(420, 650), vx: -rand(40, 70), o: rand(.15, .4) };
    if (t === 'fireflies') return { x, y, r: rand(1.5, 3), vx: rand(-6, 6), vy: rand(-6, 6), phase: rand(0, Math.PI * 2), speed: rand(.6, 1.4), o: rand(.4, .9) };
    if (t === 'bokeh') return { x, y, r: rand(18, 48), vx: rand(-4, 4), vy: rand(-4, 4), hue: ['#ff3caa', '#3c3cff', '#8b5cf6'][Math.floor(rand(0, 3))], phase: rand(0, Math.PI * 2), o: rand(.08, .18) };
    if (t === 'bubbles') return { x, y: h + rand(0, 200), r: rand(2, 6), vy: -rand(16, 40), o: rand(.2, .5) };
    return { x, y, r: rand(1, 2.4), vx: rand(-4, 4), vy: rand(-10, -2), phase: rand(0, Math.PI * 2), o: rand(.25, .55) };
  }

  function step(dt, t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of items) {
      if (type === 'snow') {
        p.sway += p.swaySpeed * dt;
        p.x += (p.vx + Math.sin(p.sway) * 14) * dt; p.y += p.vy * dt;
        if (p.y > h + 5) { p.y = -5; p.x = rand(0, w); }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${p.o})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'rain') {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y > h + 20) { p.y = -20; p.x = rand(0, w); }
        ctx.strokeStyle = `rgba(190,210,255,${p.o})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * .05, p.y - p.len); ctx.stroke();
      } else if (type === 'fireflies') {
        p.phase += p.speed * dt;
        p.x += p.vx * dt * .3; p.y += p.vy * dt * .3;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const glow = p.o * (0.5 + 0.5 * Math.sin(p.phase));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(255,240,160,${glow})`); g.addColorStop(1, 'rgba(255,240,160,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'bokeh') {
        p.phase += 0.3 * dt;
        p.x += p.vx * dt * .5; p.y += p.vy * dt * .5;
        if (p.x < -60) p.x = w + 60;
        if (p.x > w + 60) p.x = -60;
        if (p.y < -60) p.y = h + 60;
        if (p.y > h + 60) p.y = -60;
        const pulse = p.o * (0.7 + 0.3 * Math.sin(p.phase));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, hexToRgba(p.hue, pulse)); g.addColorStop(1, hexToRgba(p.hue, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      } else if (type === 'bubbles') {
        p.y += p.vy * dt; p.x += Math.sin(t / 900 + p.y) * 0.3;
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
        ctx.strokeStyle = `rgba(170,220,255,${p.o})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
      } else {
        p.phase += dt;
        p.x += p.vx * dt * .4; p.y += p.vy * dt * .4;
        if (p.y < -10) { p.y = h + 10; p.x = rand(0, w); }
        const tw = p.o * (0.6 + 0.4 * Math.sin(p.phase * 1.3));
        ctx.fillStyle = `rgba(201,184,255,${tw})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function loop(t) {
    const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
    lastT = t;
    if (!document.hidden) step(dt, t);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);

  return {
    start(nextType) {
      type = nextType;
      resize();
      items = Array.from({ length: COUNTS[type] ?? 30 }, () => make(type));
      if (!raf) raf = requestAnimationFrame(loop);
    },
    destroy() {
      cancelAnimationFrame(raf);
      raf = null;
      window.removeEventListener('resize', resize);
    },
  };
}
