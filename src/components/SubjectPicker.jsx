import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SUBJECT_PRESETS } from '../lib/constants';
import { ChevronIcon } from './icons';
import { Button, Swatch, TextInput } from './ui/primitives';

export default function SubjectPicker({ labels, selLabel, onPick, onClear }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  const wrap = useRef(null);

  // pointerdown fires before any re-render, so the clicked node is still in the DOM when we check it.
  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const current = labels.find(l => l.id === selLabel);
  const presetNames = new Set(SUBJECT_PRESETS.map(p => p.name.toLowerCase()));
  const ownLabels = labels.filter(l => !presetNames.has(l.name.toLowerCase()));

  const pick = name => { onPick(name); setOpen(false); };
  const addCustom = () => {
    const name = custom.trim().slice(0, 30);
    if (!name) return;
    pick(name);
    setCustom('');
  };

  return (
    <div className="relative inline-block" ref={wrap}>
      <button
        data-subject-button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-glass py-2 pl-4 pr-3.5 text-[13.5px] font-medium text-fg backdrop-blur-xl transition hover:border-line-strong"
      >
        <span>{current ? current.name : 'No subject'}</span>
        <ChevronIcon />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: .98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: .98 }}
            transition={{ duration: .16 }}
            style={{ x: '-50%' }}
            className="absolute left-1/2 top-[calc(100%+10px)] z-50 max-h-[min(60vh,380px)] w-[260px] overflow-y-auto rounded-panel border border-line-strong bg-glass-strong p-2.5 text-left shadow-pop backdrop-blur-2xl"
          >
            <div className="cursor-pointer rounded-[10px] px-3 py-2 text-[13.5px] hover:bg-fg/[.08]" onClick={() => { onClear(); setOpen(false); }}>
              No subject
            </div>
            {[...SUBJECT_PRESETS, ...ownLabels].map(p => (
              <div key={p.name} data-subject={p.name} className="flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-[13.5px] hover:bg-fg/[.08]" onClick={() => pick(p.name)}>
                <Swatch color={p.color} />{p.name}
              </div>
            ))}
            <div className="mt-2 flex gap-1.5 border-t border-line pt-2">
              <TextInput
                maxLength={30} placeholder="Custom subject" className="min-w-0 px-2.5 py-1.5 text-[13px]"
                value={custom} onChange={e => setCustom(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCustom(); }}
              />
              <Button onClick={addCustom}>Add</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
