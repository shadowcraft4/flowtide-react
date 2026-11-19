import { useState } from 'react';
import { kindName } from '../lib/time';
import { makeProgressImage } from '../lib/exportImage';
import { Button, Card, ProgressBar, Swatch, inputClass } from './ui/primitives';
import { cn } from '@/lib/utils';

const muted = 'text-sm text-muted';

function Stat({ value, label }) {
  return (
    <div className="stat rounded-panel border border-line bg-fg/[.05] px-3 py-4 text-center">
      <b className="block font-display text-[32px] font-extrabold leading-none text-fg [font-stretch:85%]">{value}</b>
      <span className="mt-1.5 block text-[11.5px] text-muted">{label}</span>
    </div>
  );
}

export default function StatsView({ stats, sessions, labels, goal }) {
  const [filter, setFilter] = useState('all');
  const [image, setImage] = useState(null);
  const [csv, setCsv] = useState(null);

  const validFilter = filter === 'all' || filter === '' || labels.some(l => l.id === filter) ? filter : 'all';
  const filtered = validFilter === 'all' ? sessions : sessions.filter(s => (s.label || '') === validFilter);
  const history = filtered.slice(-300).reverse();
  const maxDay = Math.max(...stats.week.map(d => d.mins), 1);
  const maxSubject = Math.max(...stats.subjects.map(r => r.secs), 1);

  const showCsv = () => {
    const rows = ['date,type,minutes', ...sessions.map(s => `${s.date},${s.kind || 'focus'},${(s.seconds / 60).toFixed(1)}`)];
    setCsv(rows.join('\n'));
  };

  return (
    <>
      <Card title="Progress">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat value={stats.streak} label="day streak" />
          <Stat value={stats.longest} label="longest streak" />
          <Stat value={Math.round(stats.todayMin)} label="min today" />
          <Stat value={Math.round(stats.weekMin)} label="min this week" />
        </div>
      </Card>

      <Card title="Weekly goal">
        <ProgressBar pct={stats.goalPct} />
        <p className={muted}>{Math.round(stats.weekMin)} of {goal} min this week ({Math.round(stats.goalPct)}%)</p>
        {stats.goalReached && <p className="mt-2 inline-block rounded-full border border-good/30 bg-good/10 px-3 py-1 text-[13px] text-good">Goal reached. Nice work this week.</p>}
      </Card>

      <Card title="By subject">
        {stats.subjects.map(r => (
          <div key={r.key} className="mb-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><Swatch color={r.color || '#9893a8'} />{r.name}</span>
              <span className="text-muted">{Math.round(r.secs / 60)} min</span>
            </div>
            <ProgressBar pct={(r.secs / maxSubject * 100).toFixed(1)} color={r.color} className="mt-1.5 h-2" />
          </div>
        ))}
        {!stats.subjects.length && <p className={muted}>No sessions tagged with a subject yet.</p>}
      </Card>

      <Card title="Last 7 days">
        <div className="mb-3 flex h-40 items-end gap-2.5">
          {stats.week.map((d, i) => (
            <div key={i} className="flex h-full flex-1 flex-col items-center gap-1.5">
              <div className="relative w-full flex-1 overflow-hidden rounded-[10px] bg-fg/[.06]">
                <i
                  title={`${Math.round(d.mins)} min`}
                  className="absolute inset-x-0 bottom-0 rounded-[10px] bg-accent shadow-[0_0_18px_rgb(var(--accent)/.35)] transition-[height] duration-700 ease-out"
                  style={{ height: Math.max(2, d.mins / maxDay * 100) + '%' }}
                />
              </div>
              <em className="text-[11px] not-italic text-muted">{d.label}</em>
            </div>
          ))}
        </div>
        <p className={muted}>Average per day this week: <b className="text-fg">{Math.round(stats.avgDay)}</b> min</p>
      </Card>

      <Card title="Heat map" aside="last 12 weeks">
        <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
          {stats.heat.map(c => (
            <div
              key={c.key} title={`${c.key}: ${Math.round(c.mins)} min`}
              className={cn('aspect-square rounded-[3px]', c.opacity ? 'bg-accent' : 'bg-fg/[.07]')}
              style={c.opacity ? { opacity: c.opacity } : undefined}
            />
          ))}
        </div>
      </Card>

      <Card title="Session history" aside={`${filtered.length} sessions`}>
        <select value={validFilter} onChange={e => setFilter(e.target.value)} className={cn(inputClass, 'mb-3 bg-surface')}>
          <option value="all">All subjects</option>
          <option value="">No subject</option>
          {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <ul className="max-h-[360px] overflow-y-auto">
          {history.map((s, i) => {
            const l = s.label ? labels.find(x => x.id === s.label) : null;
            return (
              <li key={i} className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-sm last:border-b-0">
                <span className="flex min-w-0 items-center gap-2">
                  {l && <Swatch color={l.color} />}
                  <span className="truncate">{s.date} · {kindName(s.kind)}{l ? ` · ${l.name}` : ''}{s.task ? ` · ${s.task}` : ''}</span>
                </span>
                <span className="shrink-0 text-muted">{Math.round(s.seconds / 60)} min</span>
              </li>
            );
          })}
        </ul>
        {!history.length && <p className={muted}>No sessions yet. Finish a session to log it.</p>}
      </Card>

      <Card title="Export">
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => setImage(makeProgressImage(stats, goal))}>Create progress image</Button>
          <Button onClick={showCsv}>Show as CSV</Button>
        </div>
        {image && <img className="export mt-3 w-full rounded-panel border border-line" alt="Flowtide progress" src={image} />}
        {csv != null && <textarea readOnly value={csv} className={cn(inputClass, 'mt-3 h-36 w-full font-mono text-xs')} />}
      </Card>
    </>
  );
}
