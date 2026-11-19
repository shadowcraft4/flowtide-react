import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, Card, TextInput } from './ui/primitives';

export default function TaskCard({ tasks, currentTask, onAdd, onSetDone, onDelete, onPick }) {
  const [text, setText] = useState('');

  const add = () => {
    const v = text.trim().slice(0, 80);
    if (!v) return;
    onAdd(v);
    setText('');
  };

  const ordered = [...tasks.filter(t => !t.done), ...tasks.filter(t => t.done)];

  return (
    <Card className="mx-auto mt-4 max-w-[440px] px-5 py-5 text-left">
      <h3 className="mb-3 text-[11.5px] font-semibold uppercase tracking-[.09em] text-muted-soft">Tasks that ride along</h3>
      <div className="mb-2 flex gap-2">
        <TextInput
          maxLength={80} placeholder="Add a task to focus on" data-task-input
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <Button id="taskAdd" onClick={add}>Add</Button>
      </div>
      <ul>
        {ordered.length ? ordered.map(t => (
          <li
            key={t.id} data-task={t.id}
            className={cn(
              'flex items-center gap-2.5 border-b border-line px-0.5 py-2.5 text-sm last:border-b-0',
              t.id === currentTask && 'rounded-[10px] bg-accent/10 pl-2 shadow-[inset_0_0_0_1px_rgba(139,92,246,.25)]',
            )}
          >
            <input type="checkbox" className="h-[18px] w-[18px] accent-accent" checked={t.done} onChange={e => onSetDone(t.id, e.target.checked)} />
            <span className={cn('min-w-0 flex-1 cursor-pointer break-words', t.done && 'text-muted-soft line-through')} onClick={() => onPick(t.id)}>{t.text}</span>
            <Button variant="small" aria-label="Delete task" onClick={() => onDelete(t.id)}>✕</Button>
          </li>
        )) : <li className="py-2 text-sm text-muted">No tasks yet — add one to focus on.</li>}
      </ul>
    </Card>
  );
}
