import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib/time';
import { cn } from '@/lib/utils';
import { Button, Card, Swatch, TextInput, inputClass } from './ui/primitives';

// Commits on blur or Enter (like a native "change" event), not on every keystroke,
// so typing "4" on the way to "45" doesn't briefly set a 4-minute timer.
function NumField({ value, min, max, onCommit, inputRef }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  const commit = () => {
    const v = clamp(draft, min, max, value);
    setDraft(String(v));
    if (v !== value) onCommit(v);
  };
  return (
    <input
      ref={inputRef} type="number" min={min} max={max} value={draft}
      className={cn(inputClass, 'w-[92px] text-center')}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
    />
  );
}

function Toggle({ checked, onChange }) {
  return (
    <span className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggleTrack" />
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="field flex items-center justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <label className="text-sm text-fg/90">{label}</label>
      <span className="flex items-center gap-2 text-sm text-muted">{children}</span>
    </div>
  );
}

export default function SettingsView({ settings: S, onSettings, labels, onAddLabel, onDeleteLabel, onClearData, focusDuration, onFocusDurationDone }) {
  const focusRef = useRef(null);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#8b5cf6');
  const [armed, setArmed] = useState(false);

  // Arriving here from the "Custom" interval chip: put the cursor in the Focus field.
  useEffect(() => {
    if (!focusDuration) return;
    focusRef.current?.focus();
    focusRef.current?.select();
    onFocusDurationDone();
  }, [focusDuration, onFocusDurationDone]);

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);

  const addLabel = () => {
    const name = labelName.trim().slice(0, 30);
    if (!name) return;
    onAddLabel(name, labelColor);
    setLabelName('');
  };

  const clear = () => {
    if (!armed) { setArmed(true); return; }
    setArmed(false);
    onClearData();
  };

  const num = (key, min, max, ref) => (
    <NumField value={S[key]} min={min} max={max} inputRef={ref} onCommit={v => onSettings({ [key]: v })} />
  );

  return (
    <>
      <Card title="Durations">
        <Field label="Focus">{num('focus', 1, 180, focusRef)} min</Field>
        <Field label="Break">{num('brk', 1, 60)} min</Field>
        <Field label="Long break">{num('longBrk', 1, 90)} min</Field>
        <Field label="Long break after">{num('longEvery', 1, 12)} sessions</Field>
        <Field label="Countdown length">{num('cd', 1, 1440)} min</Field>
      </Card>

      <Card title="Sound">
        <Field label="Sound when a timer ends"><Toggle checked={S.sound} onChange={v => onSettings({ sound: v })} /></Field>
        <Field label="Start next phase automatically"><Toggle checked={S.auto} onChange={v => onSettings({ auto: v })} /></Field>
      </Card>

      <Card title="Weekly goal">
        <Field label="Goal (minutes)">{num('goal', 1, 10000)}</Field>
      </Card>

      <Card title="Subjects">
        <div className="flex flex-wrap gap-2">
          <TextInput
            maxLength={30} placeholder="Subject name"
            value={labelName} onChange={e => setLabelName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addLabel(); }}
          />
          <input
            type="color" value={labelColor} onChange={e => setLabelColor(e.target.value)}
            className="h-[38px] w-[46px] cursor-pointer rounded-tile border border-line bg-transparent p-1"
          />
          <Button onClick={addLabel}>Add</Button>
        </div>
        <ul className="mt-3">
          {labels.length ? labels.map(l => (
            <li key={l.id} className="flex items-center justify-between border-b border-line py-2.5 text-sm last:border-b-0">
              <span className="flex items-center gap-2"><Swatch color={l.color} />{l.name}</span>
              <Button variant="small" onClick={() => onDeleteLabel(l.id)}>Delete</Button>
            </li>
          )) : <li className="py-2 text-sm text-muted">No subjects yet.</li>}
        </ul>
      </Card>

      <Card title="Data">
        <p className="mb-3 text-sm text-muted">Stored in this browser only.</p>
        <Button
          data-clear onClick={clear}
          className={cn(armed && 'border-danger/60 bg-danger/15 text-danger hover:bg-danger/20')}
        >{armed ? 'Click again to confirm' : 'Clear all data'}</Button>
      </Card>
    </>
  );
}
