// Painted, animated backgrounds for each vibe. Each painter takes (width, height, devicePixelRatio)
// and returns draw(ctx, timeMs). Static parts are pre-rendered to offscreen layers once;
// only the moving parts (rain, koi, aurora, candle) are drawn every frame.
// Kept in sync with the design concept in design/flowtide-moods.html.

const M = 28; // layer margin so parallax never shows an edge
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function layer(W, H, dpr, paint) {
  const c = document.createElement('canvas'); c.width = Math.ceil((W + 2 * M) * dpr); c.height = Math.ceil((H + 2 * M) * dpr);
  const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, M * dpr, M * dpr); paint(x); return c;
}
function grad(x, x0, y0, x1, y1, stops) { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
// Fades to the same colour at zero alpha; fading to transparent black would leave a grey halo on light skies.
const clear = c => c.startsWith('#') ? c.slice(0, 7) + '00' : c.replace(/[\d.]+\)$/, '0)');
function glow(x, cx, cy, r, color, a) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, color); g.addColorStop(1, clear(color)); x.globalAlpha = a; x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.globalAlpha = 1; }
const put = (ctx, L, W, H, px, py, d) => ctx.drawImage(L, -M + px * d, -M + py * d, W + 2 * M, H + 2 * M);
function sky(W, H, dpr, stops) { return layer(W, H, dpr, x => { x.fillStyle = grad(x, 0, -M, 0, H + M, stops); x.fillRect(-M, -M, W + 2 * M, H + 2 * M); }); }

export const SCENES = {
  lofi(W, H, dpr) {
    const r = rng(7), S = Math.min(W, H);
    const back = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, -M, 0, H + M, [[0, '#0d0a24'], [.55, '#2a2160'], [1, '#5a3f9a']]); x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      for (let i = 0; i < 70; i++) { x.globalAlpha = r() * .7; x.fillStyle = '#fff'; x.fillRect(r() * W, r() * H * .5, 1.2, 1.2); }
      x.globalAlpha = 1; glow(x, W * .78, H * .2, S * .28, '#c9b8ff', .45);
      // Crescent: the moon disc minus an offset disc, clipped so nothing spills past the rim.
      x.save(); x.beginPath(); x.arc(W * .78, H * .2, S * .055, 0, 7); x.clip();
      x.fillStyle = '#f6eeff'; x.beginPath(); x.arc(W * .78, H * .2, S * .055, 0, 7); x.arc(W * .78 + S * .024, H * .2 - S * .012, S * .05, 0, 7, true); x.fill('evenodd'); x.restore();
    });
    const city = (col, hMin, hMax, wMin, wMax, lit, warm) => layer(W, H, dpr, x => {
      for (let bx = -M; bx < W + M;) {
        const bw = wMin + r() * (wMax - wMin), bh = H * (hMin + r() * (hMax - hMin));
        x.fillStyle = col; x.fillRect(bx, H - bh, bw, bh + M);
        if (r() < .3) x.fillRect(bx + bw * .4, H - bh - 14, 2, 14);
        for (let wy = H - bh + 10; wy < H - 6; wy += 11) for (let wx = bx + 6; wx < bx + bw - 8; wx += 9)
          if (r() < lit) { x.globalAlpha = .35 + r() * .6; x.fillStyle = r() < .8 ? warm : '#9fd3ff'; x.fillRect(wx, wy, 4, 5); x.globalAlpha = 1; x.fillStyle = col; }
        bx += bw + 2;
      }
    });
    const far = city('#2b2361', .3, .55, 26, 60, .22, '#ffcf7a'), near = city('#140f2e', .14, .34, 40, 90, .35, '#ffc46b');
    const drops = Array.from({ length: 34 }, () => ({ x: r() * W, y: r() * H, r: 2 + r() * 5, v: 0, wait: r() * 400 }));
    return (ctx, t, px, py) => {
      put(ctx, back, W, H, px, py, 4); put(ctx, far, W, H, px, py, 10); put(ctx, near, W, H, px, py, 20);
      for (const d of drops) {
        if (d.wait > 0) d.wait--; else { d.v = Math.min(3, d.v + .05); d.y += d.v; if (d.y > H + 10) { d.y = -10; d.x = Math.random() * W; d.v = 0; d.wait = Math.random() * 300; } }
        ctx.fillStyle = 'rgba(220,210,255,.12)'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill();
        if (d.v > .5) { ctx.strokeStyle = 'rgba(220,210,255,.08)'; ctx.lineWidth = d.r * .9; ctx.beginPath(); ctx.moveTo(d.x, d.y - d.r); ctx.lineTo(d.x, d.y - d.r - d.v * 18); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(d.x - d.r * .35, d.y - d.r * .35, d.r * .25, 0, 7); ctx.fill();
      }
    };
  },

  koi(W, H, dpr) {
    const r = rng(41), S = Math.min(W, H);
    const water = layer(W, H, dpr, x => {
      const g = x.createRadialGradient(W * .5, H * .45, S * .1, W * .5, H * .5, W * .75);
      g.addColorStop(0, '#2b8f8a'); g.addColorStop(.5, '#17666c'); g.addColorStop(1, '#0b3d47');
      x.fillStyle = g; x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      for (let i = 0; i < 220; i++) {
        x.globalAlpha = .05 + r() * .09; x.fillStyle = r() < .55 ? '#08303a' : '#86cfc0';
        x.beginPath(); x.ellipse(r() * W, r() * H, 3 + r() * 10, 2 + r() * 7, r() * 3, 0, 7); x.fill();
      }
      x.globalAlpha = 1;
    });
    const KOI = [{ b: '#ff7a3d', s: '#fff4ea' }, { b: '#fff4ea', s: '#ff6a2a' }, { b: '#ffb340', s: '#fff4ea' }, { b: '#f6f1ea', s: '#22201e' }, { b: '#ff5a36', s: '#ffd9a8' }, { b: '#fff4ea', s: '#ff8a4c' }];
    const pick = () => ({ x: W * (.1 + r() * .8), y: H * (.1 + r() * .8) });
    const fish = KOI.map(p => {
      const t = pick();
      return { x: r() * W, y: r() * H, a: r() * 6.28, v: .45 + r() * .45, len: S * (.1 + r() * .05), tx: t.x, ty: t.y, p,
        spots: Array.from({ length: 4 }, () => ({ i: .15 + r() * .6, o: (r() - .5) * 1.2, r: .04 + r() * .05 })) };
    });
    // Pads stay out of the middle third so the clock sits on open water.
    const pads = Array.from({ length: 8 }, (_, i) => {
      const side = i % 2 ? r() * .3 : .7 + r() * .3;
      return { x: W * side, y: r() * H, r: S * (.04 + r() * .05), rot: r() * 6.28, flower: r() < .4 };
    });
    const ripples = [];
    let nextRipple = 0;
    function drawFish(ctx, f, t, shadow) {
      const N = 14, seg = f.len / N, dx = Math.cos(f.a), dy = Math.sin(f.a), nx = -dy, ny = dx;
      const ox = shadow ? 8 : 0, oy = shadow ? 10 : 0, L = [], R = [], C = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, wag = Math.sin(t / 170 * (f.v + .6) - i * .45) * f.len * .07 * s;
        const cx = f.x - dx * seg * i + nx * wag + ox, cy = f.y - dy * seg * i + ny * wag + oy;
        const w = f.len * .12 * (s < .25 ? .15 + .85 * Math.sin(s / .25 * Math.PI / 2) : 1 - (s - .25) / .75 * .85);
        C.push([cx, cy, w]); L.push([cx + nx * w, cy + ny * w]); R.push([cx - nx * w, cy - ny * w]);
      }
      ctx.fillStyle = shadow ? 'rgba(0,25,30,.28)' : f.p.b;
      // Pectoral fins
      const [fx, fy] = C[3]; ctx.globalAlpha = shadow ? 1 : .75;
      for (const side of [1, -1]) { ctx.beginPath(); ctx.ellipse(fx + nx * f.len * .14 * side, fy + ny * f.len * .14 * side, f.len * .09, f.len * .04, f.a + side * .9, 0, 7); ctx.fill(); }
      // Tail fin
      const [ex, ey] = C[N], wagT = Math.sin(t / 170 * (f.v + .6) - N * .45) * f.len * .08;
      ctx.beginPath(); ctx.moveTo(ex, ey);
      ctx.quadraticCurveTo(ex - dx * f.len * .12 + nx * f.len * .14, ey - dy * f.len * .12 + ny * f.len * .14, ex - dx * f.len * .22 + nx * (f.len * .12 + wagT), ey - dy * f.len * .22 + ny * (f.len * .12 + wagT));
      ctx.lineTo(ex - dx * f.len * .14 + nx * wagT, ey - dy * f.len * .14 + ny * wagT);
      ctx.lineTo(ex - dx * f.len * .22 - nx * (f.len * .12 - wagT), ey - dy * f.len * .22 - ny * (f.len * .12 - wagT));
      ctx.quadraticCurveTo(ex - dx * f.len * .12 - nx * f.len * .14, ey - dy * f.len * .12 - ny * f.len * .14, ex, ey); ctx.fill();
      ctx.globalAlpha = 1;
      // Body
      ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i <= N; i++) ctx.lineTo(L[i][0], L[i][1]);
      for (let i = N; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
      ctx.closePath(); ctx.fill();
      if (shadow) return;
      ctx.fillStyle = f.p.s;
      for (const sp of f.spots) { const [cx, cy, w] = C[Math.round(sp.i * N)]; ctx.beginPath(); ctx.arc(cx + nx * w * sp.o, cy + ny * w * sp.o, sp.r * f.len, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(C[2][0], C[2][1], f.len * .05, f.len * .025, f.a, 0, 7); ctx.fill();
    }
    return (ctx, t) => {
      put(ctx, water, W, H, 0, 0, 0);
      for (const f of fish) {
        const want = Math.atan2(f.ty - f.y, f.tx - f.x);
        let d = want - f.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        f.a += Math.max(-.018, Math.min(.018, d)); f.x += Math.cos(f.a) * f.v; f.y += Math.sin(f.a) * f.v;
        if (Math.hypot(f.tx - f.x, f.ty - f.y) < 50) { const n = pick(); f.tx = n.x; f.ty = n.y; }
      }
      for (const f of fish) drawFish(ctx, f, t, true);
      for (const f of fish) drawFish(ctx, f, t, false);
      if (t > nextRipple) { ripples.push({ x: Math.random() * W, y: Math.random() * H, age: 0 }); nextRipple = t + 900 + Math.random() * 1200; }
      ctx.lineWidth = 1.4;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const q = ripples[i]; q.age += .006; if (q.age >= 1) { ripples.splice(i, 1); continue; }
        for (let k = 0; k < 2; k++) { const a = q.age - k * .15; if (a <= 0) continue; ctx.strokeStyle = `rgba(220,255,245,${(1 - a) * .35})`; ctx.beginPath(); ctx.ellipse(q.x, q.y, a * S * .12, a * S * .085, 0, 0, 7); ctx.stroke(); }
      }
      for (const p of pads) {
        p.rot += .0006;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = 'rgba(0,25,30,.25)'; ctx.beginPath(); ctx.arc(5, 7, p.r, 0, 7); ctx.fill();
        ctx.fillStyle = '#5f9e6e'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, p.r, .35, Math.PI * 2 - .05); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(200,240,190,.35)'; ctx.lineWidth = 1;
        for (let k = 0; k < 6; k++) { const a = .5 + k * 1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * p.r * .85, Math.sin(a) * p.r * .85); ctx.stroke(); }
        if (p.flower) {
          for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = k % 2 ? '#ffc2d4' : '#ff9fbe'; ctx.beginPath(); ctx.ellipse(p.r * .28, 0, p.r * .3, p.r * .13, 0, 0, 7); ctx.fill(); }
          ctx.fillStyle = '#ffd86b'; ctx.beginPath(); ctx.arc(0, 0, p.r * .12, 0, 7); ctx.fill();
        }
        ctx.restore();
      }
    };
  },

  sakura(W, H, dpr) {
    const r = rng(23), S = Math.min(W, H);
    const back = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, -M, 0, H + M, [[0, '#ffd3e0'], [.45, '#fde6ee'], [1, '#e4e0fa']]); x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      glow(x, W * .3, H * .35, S * .45, '#fff6f9', .9);
    });
    const mount = layer(W, H, dpr, x => {
      const cx = W * .32, top = H * .3, base = H * .78;
      x.fillStyle = '#a4ade0'; x.beginPath(); x.moveTo(cx - W * .55, base); x.quadraticCurveTo(cx - W * .12, top + H * .1, cx - W * .03, top); x.lineTo(cx + W * .03, top);
      x.quadraticCurveTo(cx + W * .12, top + H * .1, cx + W * .55, base); x.closePath(); x.fill();
      x.fillStyle = '#f5f3ff'; x.beginPath(); x.moveTo(cx - W * .09, top + H * .09);
      for (let i = 0; i <= 6; i++) x.lineTo(cx - W * .09 + i * W * .03, top + H * (i % 2 ? .12 : .085));
      x.lineTo(cx + W * .03, top); x.lineTo(cx - W * .03, top); x.closePath(); x.fill();
      x.fillStyle = grad(x, 0, H * .62, 0, H * .8, [[0, 'rgba(255,240,246,0)'], [1, 'rgba(255,240,246,.95)']]); x.fillRect(-M, H * .6, W + 2 * M, H * .25);
      x.fillStyle = '#e7c3da'; x.beginPath(); x.moveTo(-M, H + M);
      for (let xx = -M; xx <= W + M; xx += 10) x.lineTo(xx, H * .8 + Math.sin(xx / W * 7) * 10);
      x.lineTo(W + M, H + M); x.fill();
    });
    const ax = W + 10, ay = -10;
    const branch = layer(W, H, dpr, x => {
      x.lineCap = 'round';
      const blossoms = [];
      (function grow(bx, by, ang, len, w, depth) {
        const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
        x.strokeStyle = '#4a2838'; x.lineWidth = w; x.beginPath(); x.moveTo(bx, by);
        x.quadraticCurveTo((bx + ex) / 2 + (r() - .5) * len * .3, (by + ey) / 2 + (r() - .5) * len * .3, ex, ey); x.stroke();
        if (depth > 0) { grow(ex, ey, ang - .35 - r() * .3, len * (.62 + r() * .15), w * .66, depth - 1); grow(ex, ey, ang + .25 + r() * .35, len * (.55 + r() * .2), w * .6, depth - 1); if (r() < .5) blossoms.push([ex, ey]); }
        else blossoms.push([ex, ey]);
      })(ax, ay + S * .05, Math.PI * .8, S * .22, 12, 5);
      const pinks = ['#f7a6bd', '#ffc9d6', '#f28fae', '#ffe0e8'];
      for (const [bx, by] of blossoms) for (let k = 0; k < 7; k++) {
        const ox = bx + (r() - .5) * 26, oy = by + (r() - .5) * 22, rr = 3 + r() * 5;
        x.fillStyle = pinks[k % 4]; x.beginPath(); x.arc(ox, oy, rr, 0, 7); x.fill();
        x.fillStyle = '#c0436b'; x.beginPath(); x.arc(ox, oy, rr * .25, 0, 7); x.fill();
      }
    });
    return (ctx, t, px, py) => {
      put(ctx, back, W, H, px, py, 3); put(ctx, mount, W, H, px, py, 9);
      ctx.save(); ctx.translate(ax + px * 22, ay + py * 22); ctx.rotate(Math.sin(t / 2400) * .018); ctx.translate(-ax, -ay);
      ctx.drawImage(branch, -M, -M, W + 2 * M, H + 2 * M); ctx.restore();
    };
  },

  aurora(W, H, dpr) {
    const r = rng(53), S = Math.min(W, H);
    const sky = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, -M, 0, H + M, [[0, '#040a1c'], [.55, '#0b1d3a'], [1, '#18355e']]); x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      for (let i = 0; i < 150; i++) { x.globalAlpha = .2 + r() * .7; x.fillStyle = '#fff'; const s = r() < .1 ? 1.8 : 1.1; x.fillRect(r() * W, r() * H * .65, s, s); }
      x.globalAlpha = 1;
    });
    const ridge = (base, rough, col, snow) => layer(W, H, dpr, x => {
      const pts = [[-M, H * base]]; const n = 14;
      for (let i = 1; i <= n; i++) pts.push([-M + (W + 2 * M) * i / n, H * (base - r() * rough)]);
      x.fillStyle = col; x.beginPath(); x.moveTo(-M, H + M); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(W + M, H + M); x.fill();
      if (snow) { x.fillStyle = 'rgba(200,225,255,.22)'; for (let i = 1; i < pts.length; i++) { const [px2, py2] = pts[i]; if (py2 < H * (base - rough * .55)) { x.beginPath(); x.moveTo(px2, py2); x.lineTo(px2 - 18, py2 + 22); x.lineTo(px2 + 16, py2 + 20); x.fill(); } } }
    });
    const far = ridge(.66, .2, '#10254a', true), near = ridge(.74, .12, '#0a1832', false);
    const ground = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, H * .82, 0, H + M, [[0, '#1c3a5c'], [1, '#0c1b33']]);
      x.beginPath(); x.moveTo(-M, H + M); for (let xx = -M; xx <= W + M; xx += 12) x.lineTo(xx, H * .85 + Math.sin(xx / 90) * 6); x.lineTo(W + M, H + M); x.fill();
      x.fillStyle = 'rgba(78,240,168,.08)'; x.fillRect(-M, H * .84, W + 2 * M, H * .2);
      for (let tx2 = -M; tx2 < W + M; tx2 += 14 + r() * 26) {
        if (tx2 > W * .3 && tx2 < W * .7 && r() < .6) continue;
        const h = H * (.1 + r() * .16), by = H * .86 + r() * 8, w = h * .32;
        x.fillStyle = '#040b18';
        for (let k = 0; k < 4; k++) { const ty2 = by - h + k * h * .22, tw = w * (.35 + k * .22); x.beginPath(); x.moveTo(tx2, ty2); x.lineTo(tx2 + tw, ty2 + h * .34); x.lineTo(tx2 - tw, ty2 + h * .34); x.fill(); }
        x.fillRect(tx2 - 2, by - 4, 4, 8);
      }
    });
    // Aurora curtains, shaped like the real thing: a bright green lower edge with rays fading
    // upward into pink and violet. Each column is a stretched copy of one smooth gradient strip,
    // so there are no hard bands, and every motion term is slow so nothing flickers.
    // Drawn at a third of the screen size, then scaled up for a soft glow.
    const SC = 3, AW = Math.ceil(W / SC), AH = Math.ceil(H / SC), ac = document.createElement('canvas'); ac.width = AW; ac.height = AH;
    const ax = ac.getContext('2d');
    const strip = (tip, col) => {
      const c = document.createElement('canvas'); c.width = 1; c.height = 128;
      const g = c.getContext('2d'), lg = g.createLinearGradient(0, 0, 0, 128);
      lg.addColorStop(0, tip + '00'); lg.addColorStop(.35, tip + '55'); lg.addColorStop(.7, col + '99');
      lg.addColorStop(.93, col + 'ff'); lg.addColorStop(1, col + '00');
      g.fillStyle = lg; g.fillRect(0, 0, 1, 128); return c;
    };
    const ribbons = [
      { edge: .32, h: .2, sp: 1, s: strip('#c46bff', '#4ef0a8') },
      { edge: .4, h: .17, sp: -.7, s: strip('#8f7bff', '#3fd6e0') },
      { edge: .47, h: .14, sp: .55, s: strip('#ff7ac8', '#5dffb8') },
    ];
    return (ctx, t) => {
      put(ctx, sky, W, H, 0, 0, 0);
      ax.clearRect(0, 0, AW, AH); ax.globalCompositeOperation = 'lighter';
      ribbons.forEach((rb, k) => {
        for (let x = 0; x < AW; x++) {
          const X = x * SC;
          const edge = H * rb.edge + Math.sin(X * .0032 + t * .00011 * rb.sp + k * 1.7) * H * .06 + Math.sin(X * .0085 - t * .00016 + k) * H * .018;
          const h = H * (rb.h + .05 * Math.sin(X * .0045 + t * .00014 + k * 2));
          const a = Math.min(1, Math.max(0, .32 + .3 * Math.sin(X * .009 - t * .0003 * rb.sp + k) + .14 * Math.sin(X * .021 + t * .00019)));
          if (a < .02) continue;
          ax.globalAlpha = a;
          ax.drawImage(rb.s, x, (edge - h) / SC, 1.6, h / SC);
        }
      });
      ax.globalAlpha = 1; ax.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.globalAlpha = .9; ctx.drawImage(ac, 0, 0, W, H);
      ctx.globalAlpha = .35; ctx.drawImage(ac, -10, -6, W + 20, H + 12); ctx.restore();
      put(ctx, far, W, H, 0, 0, 0); put(ctx, near, W, H, 0, 0, 0); put(ctx, ground, W, H, 0, 0, 0);
    };
  },

  // Plain dark: one still frame (near-black, a faint lavender wash at the top, soft vignette).
  // Marked `still` so the engine paints it once instead of every frame.
  plain(W, H, dpr) {
    const S = Math.min(W, H);
    const bg = layer(W, H, dpr, x => {
      x.fillStyle = '#0e0d13'; x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      glow(x, W * .5, -H * .1, Math.max(W, H) * .7, '#2a2540', .55);
      const v = x.createRadialGradient(W * .5, H * .45, S * .3, W * .5, H * .5, Math.max(W, H) * .8);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)');
      x.fillStyle = v; x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    });
    const draw = ctx => put(ctx, bg, W, H, 0, 0, 0);
    draw.still = true;
    return draw;
  },

  academia(W, H, dpr) {
    const r = rng(19), S = Math.min(W, H);
    const books = ['#5b1f1f', '#24402f', '#1f2a44', '#7a5a22', '#3b2a20', '#6b2f3a', '#2f4a3a', '#4a3a5a'];
    const shelves = layer(W, H, dpr, x => {
      x.fillStyle = '#1b120d'; x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
      const rowH = H / 3.6;
      for (let ry = -M + 6; ry < H + M; ry += rowH) {
        for (let bx = -M; bx < W + M;) {
          const bw = 9 + r() * 16, bh = rowH * (.62 + r() * .3), col = books[Math.floor(r() * books.length)], top = ry + rowH - 12 - bh;
          x.fillStyle = col; x.fillRect(bx, top, bw, bh);
          x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(bx + 1, top, 2, bh);
          x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(bx + bw - 2, top, 2, bh);
          if (r() < .7) { x.fillStyle = '#c9a25a'; x.globalAlpha = .7; x.fillRect(bx + 2, top + bh * .15, bw - 4, 2); x.fillRect(bx + 2, top + bh * .78, bw - 4, 2); x.globalAlpha = 1; }
          bx += bw + (r() < .08 ? 18 : 1);
        }
        x.fillStyle = '#3d281b'; x.fillRect(-M, ry + rowH - 12, W + 2 * M, 12);
        x.fillStyle = 'rgba(255,220,170,.12)'; x.fillRect(-M, ry + rowH - 12, W + 2 * M, 1.5);
      }
      const v = x.createRadialGradient(W * .25, H * .8, S * .1, W * .5, H * .5, W * .8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.72)');
      x.fillStyle = v; x.fillRect(-M, -M, W + 2 * M, H + 2 * M);
    });
    const cx = W * .09, cy = H * .9;
    return (ctx, t, px, py) => {
      put(ctx, shelves, W, H, px, py, 8);
      const fl = .85 + Math.sin(t / 90) * .05 + Math.sin(t / 37) * .04 + Math.sin(t / 211) * .06;
      ctx.globalCompositeOperation = 'lighter'; glow(ctx, cx + px * 22, cy - 40 + py * 22, S * .9 * fl, 'rgba(255,150,60,.55)', .55); ctx.globalCompositeOperation = 'source-over';
      const ox = cx + px * 22, oy = cy + py * 22;
      ctx.fillStyle = grad(ctx, ox - 10, 0, ox + 10, 0, [[0, '#d8c39e'], [.5, '#f3e6c8'], [1, '#bda57c']]); ctx.fillRect(ox - 10, oy - 60, 20, 80);
      ctx.save(); ctx.translate(ox, oy - 64); ctx.scale(1, fl);
      const fg = ctx.createRadialGradient(0, -6, 1, 0, -8, 16); fg.addColorStop(0, '#fff6d6'); fg.addColorStop(.4, '#ffc14d'); fg.addColorStop(1, 'rgba(255,120,30,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(0, -26 + Math.sin(t / 70) * 2); ctx.quadraticCurveTo(9, -6, 0, 2); ctx.quadraticCurveTo(-9, -6, 0, -26 + Math.sin(t / 70) * 2); ctx.fill(); ctx.restore();
    };
  },

  golden(W, H, dpr) {
    const r = rng(31), S = Math.min(W, H), hz = H * .6;
    const back = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, -M, 0, hz, [[0, '#e98aa6'], [.45, '#ffaf8c'], [1, '#ffe0a6']]); x.fillRect(-M, -M, W + 2 * M, hz + M);
      glow(x, W * .5, hz, S * .75, '#fff1c4', .85);
      x.fillStyle = '#fff3cc'; x.beginPath(); x.arc(W * .5, hz, S * .1, Math.PI, 0); x.fill();
      x.globalAlpha = .5; x.fillStyle = '#c86a9a';
      for (let i = 0; i < 7; i++) { x.beginPath(); x.ellipse(r() * W, H * (.08 + r() * .35), W * (.08 + r() * .14), 3 + r() * 5, 0, 0, 7); x.fill(); }
      x.globalAlpha = 1;
    });
    const sea = layer(W, H, dpr, x => {
      x.fillStyle = grad(x, 0, hz, 0, H + M, [[0, '#3f8a9a'], [.4, '#25607a'], [1, '#143c55']]); x.fillRect(-M, hz, W + 2 * M, H - hz + M);
      x.fillStyle = 'rgba(255,220,180,.25)'; x.fillRect(-M, hz, W + 2 * M, 1.5);
    });
    const birds = Array.from({ length: 4 }, () => ({ x: r() * W, y: H * (.15 + r() * .25), s: 5 + r() * 5, v: .15 + r() * .2, ph: r() * 6 }));
    return (ctx, t, px, py) => {
      put(ctx, back, W, H, px, py, 4); put(ctx, sea, W, H, px, py, 12);
      const sx = W * .5 + px * 6;
      for (let i = 0; i < 26; i++) {
        const y = hz + 4 + i * i * .55 + py * 12; if (y > H) break;
        const w = (S * .2) * (1 - i / 34) * (.5 + .5 * Math.abs(Math.sin(t / 600 + i * 1.3)));
        ctx.globalAlpha = .55 - i * .015; ctx.fillStyle = '#ffe9b8'; ctx.fillRect(sx - w / 2 + Math.sin(t / 900 + i) * 6, y, w, 2);
      }
      ctx.globalAlpha = .18; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 9; k++) { const y = hz + 14 + k * k * 4 + py * 12; ctx.beginPath(); for (let xx = 0; xx <= W; xx += 14) ctx.lineTo(xx, y + Math.sin(xx / 70 + t / 800 + k) * (1 + k * .4)); ctx.stroke(); }
      ctx.globalAlpha = .75; ctx.strokeStyle = '#5b2a3e'; ctx.lineWidth = 1.6;
      for (const b of birds) { b.x += b.v; if (b.x > W + 20) b.x = -20; const f = Math.sin(t / 220 + b.ph) * b.s * .5; ctx.beginPath(); ctx.moveTo(b.x - b.s + px * 8, b.y - f); ctx.quadraticCurveTo(b.x - b.s * .4 + px * 8, b.y - b.s * .2, b.x + px * 8, b.y); ctx.quadraticCurveTo(b.x + b.s * .4 + px * 8, b.y - b.s * .2, b.x + b.s + px * 8, b.y - f); ctx.stroke(); }
      ctx.globalAlpha = 1;
    };
  },
};

// Tile previews for the Style panel: the real scene painted once at thumbnail size.
const thumbs = {};
export function sceneThumb(key) {
  if (thumbs[key]) return thumbs[key];
  const w = 150, h = 200, c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const x = c.getContext('2d');
  x.setTransform(2, 0, 0, 2, 0, 0);
  const draw = SCENES[key](w, h, 2);
  for (let i = 0; i < 3; i++) draw(x, 4000 + i * 16, 0, 0);
  return (thumbs[key] = c.toDataURL('image/jpeg', 0.85));
}

/**
 * Drives two stacked canvases so a vibe change cross-fades: the next scene is
 * painted on the hidden canvas, then the CSS opacity transition swaps them.
 */
export function createSceneEngine(canvases) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let front = 0, key = null, W = 0, H = 0, DPR = 1, raf = null, fadeUntil = 0;
  const painters = [null, null];

  function size(c) {
    c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
    c.style.width = W + 'px'; c.style.height = H + 'px';
    c.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  const painted = [false, false];
  function build(i, k) { size(canvases[i]); painters[i] = SCENES[k](W, H, DPR); painted[i] = false; }
  function draw(i, t) {
    if (!painters[i]) return;
    if (painters[i].still && painted[i]) return; // still scenes are painted once
    const ctx = canvases[i].getContext('2d');
    ctx.clearRect(0, 0, W, H);
    painters[i](ctx, t, 0, 0);
    painted[i] = true;
  }
  function measure() {
    W = window.innerWidth; H = window.innerHeight;
    // Full-screen painting is costly; 1.5x keeps it sharp without doubling the work on retina screens.
    DPR = Math.min(1.5, window.devicePixelRatio || 1);
  }
  let resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { measure(); if (key) { build(front, key); draw(front, reduced ? 4000 : performance.now()); } }, 150);
  }
  function loop(t) {
    if (!document.hidden) {
      draw(front, t);
      if (t < fadeUntil) draw(1 - front, t); else painters[1 - front] = null;
    }
    raf = requestAnimationFrame(loop);
  }

  measure();
  window.addEventListener('resize', onResize);

  return {
    setScene(next) {
      if (next === key || !SCENES[next]) return;
      const first = key === null;
      key = next;
      if (first || reduced) {
        build(front, next); draw(front, 4000);
        canvases[front].classList.remove('off'); canvases[1 - front].classList.add('off');
      } else {
        const back = 1 - front;
        build(back, next); draw(back, performance.now());
        canvases[back].classList.remove('off'); canvases[front].classList.add('off');
        fadeUntil = performance.now() + 1300;
        front = back;
      }
      if (!reduced && !raf) raf = requestAnimationFrame(loop);
    },
    destroy() {
      cancelAnimationFrame(raf); raf = null;
      clearTimeout(resizeT);
      window.removeEventListener('resize', onResize);
    },
  };
}
