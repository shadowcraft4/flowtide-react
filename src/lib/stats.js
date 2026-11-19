import { todayKey, addDays, keyToDate } from './time';

function dayTotals(sessions) {
  const map = {};
  sessions.forEach(s => { map[s.date] = (map[s.date] || 0) + s.seconds; });
  return map;
}

/** Everything the Stats page and the streak widget show, derived from the session log. */
export function computeStats(sessions, labels, goal) {
  const t = todayKey();
  const T = dayTotals(sessions);
  const minsOn = k => (T[k] || 0) / 60;

  const week = [];
  for (let i = 6; i >= 0; i--) {
    const k = addDays(t, -i);
    week.push({ label: keyToDate(k).toLocaleDateString(undefined, { weekday: 'short' }), mins: minsOn(k) });
  }
  const weekMin = week.reduce((a, d) => a + d.mins, 0);

  let k = t;
  if (!T[k]) k = addDays(t, -1);
  let streak = 0;
  while (T[k]) { streak++; k = addDays(k, -1); }

  let longest = 0, run = 0, prev = null;
  Object.keys(T).sort().forEach(kk => {
    run = prev && addDays(prev, 1) === kk ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = kk;
  });

  const heat = [];
  for (let i = 83; i >= 0; i--) {
    const kk = addDays(t, -i);
    const m = minsOn(kk);
    heat.push({ key: kk, mins: m, opacity: m > 0 ? (0.2 + 0.8 * Math.min(1, m / 120)).toFixed(2) : null });
  }

  const totals = {};
  sessions.forEach(s => { const key = s.label || '__none__'; totals[key] = (totals[key] || 0) + s.seconds; });
  const subjects = Object.keys(totals).map(key => {
    const l = key === '__none__' ? null : labels.find(x => x.id === key);
    return {
      key,
      name: l ? l.name : key === '__none__' ? 'No subject' : 'Deleted subject',
      color: l ? l.color : null,
      secs: totals[key],
    };
  }).sort((a, b) => b.secs - a.secs);

  const goalPct = Math.min(100, (weekMin / goal) * 100);

  return {
    todayMin: minsOn(t),
    weekMin,
    avgDay: weekMin / 7,
    streak,
    longest,
    goalPct,
    goalReached: weekMin >= goal,
    week,
    heat,
    subjects,
  };
}
