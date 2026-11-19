export function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function todayKey() { return dayKey(new Date()); }
export function keyToDate(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
export function addDays(k, n) { const d = keyToDate(k); d.setDate(d.getDate() + n); return dayKey(d); }

export function fmt(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = n => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

export function clamp(v, min, max, def) {
  v = parseInt(v, 10);
  if (isNaN(v)) v = def;
  return Math.min(max, Math.max(min, v));
}

export function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

export function kindName(k) { return { focus: 'Focus', countdown: 'Countdown', stopwatch: 'Stopwatch' }[k] || 'Focus'; }
