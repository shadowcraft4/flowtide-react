import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AMBIENT_TYPES, SCENES } from '../lib/constants';
import { cn } from '@/lib/utils';
import { ExpandIcon, MusicIcon, PaletteIcon } from './icons';
import { FloatingDock } from './ui/floating-dock';

const panelTitle = 'mb-3 font-display text-[15px] font-semibold';

function StylePanel({ layout, onLayout, scene, onScene }) {
  const tile = active => cn(
    'flex flex-1 flex-col items-center gap-2 rounded-panel border p-3 text-[11.5px] text-muted transition hover:-translate-y-0.5',
    active ? 'border-accent bg-accent/15 text-fg shadow-[0_0_0_1px_rgba(139,92,246,.35)]' : 'border-line bg-white/[.03] hover:border-line-strong',
  );
  return (
    <>
      <div className={panelTitle}>Style</div>
      <div className="mb-4 flex gap-2.5">
        <button data-layout="classic" className={tile(layout === 'classic')} onClick={() => onLayout('classic')}>
          <div className="font-display text-[22px] font-semibold text-fg">25:00</div>Classic
        </button>
        <button data-layout="flip" className={tile(layout === 'flip')} onClick={() => onLayout('flip')}>
          <div className="flex gap-1">
            {['25', '00'].map(n => (
              <span key={n} className="rounded-md bg-gradient-to-b from-[#2a2733] to-[#16141c] px-1.5 py-0.5 font-display text-base font-semibold text-fg shadow-[inset_0_-1px_0_rgba(0,0,0,.5)]">{n}</span>
            ))}
          </div>Flip
        </button>
      </div>
      <div className="mb-2 text-[11.5px] text-muted">Living background</div>
      <div className="grid grid-cols-5 gap-2">
        {SCENES.map(s => (
          <button
            key={s.key} title={s.name} aria-label={s.name} data-scene={s.key} onClick={() => onScene(s.key)}
            className={cn(
              `sceneTile tile-${s.key} aspect-square rounded-tile border transition hover:scale-105`,
              scene === s.key ? 'border-accent-soft shadow-[0_0_0_2px_rgba(139,92,246,.6)]' : 'border-line',
            )}
          />
        ))}
      </div>
      <div className="mt-2 text-center text-[11px] text-muted-soft">{SCENES.find(s => s.key === scene)?.name}</div>
    </>
  );
}

function AmbientPanel({ layers, onToggle, volume, onVolume }) {
  return (
    <>
      <div className={panelTitle}>Ambient music</div>
      <div className="grid grid-cols-2 gap-2">
        {AMBIENT_TYPES.map(t => (
          <button
            key={t.key} data-ambient={t.key} onClick={() => onToggle(t.key)}
            className={cn(
              'rounded-tile border px-3 py-2 text-[13px] transition',
              layers.includes(t.key) ? 'border-accent/60 bg-accent/20 text-fg' : 'border-line bg-white/[.03] text-muted hover:bg-white/[.07] hover:text-fg',
            )}
          >{t.name}</button>
        ))}
      </div>
      <div className="mt-3.5 flex items-center gap-3">
        <label className="whitespace-nowrap text-xs text-muted">Volume</label>
        <input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={e => onVolume(+e.target.value / 100)} />
      </div>
      <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted-soft">Mix multiple sounds. Fades out near the end of a session.</p>
    </>
  );
}

/** Bottom dock (Aceternity Floating Dock) with a glass panel that springs up above it. */
export default function Toolbar({ panel, onPanel, onFullScreen, style, ambient }) {
  const bar = useRef(null);
  const pop = useRef(null);

  // Close the panel on a press anywhere outside it and outside the dock.
  useEffect(() => {
    if (!panel) return;
    const onDown = e => {
      if (pop.current?.contains(e.target) || bar.current?.contains(e.target)) return;
      onPanel(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [panel, onPanel]);

  const iconClass = 'h-full w-full text-fg';
  const items = [
    { title: 'Ambient music', icon: <MusicIcon className={iconClass} />, active: panel === 'ambient', onClick: () => onPanel(panel === 'ambient' ? null : 'ambient') },
    { title: 'Style', icon: <PaletteIcon className={iconClass} />, active: panel === 'style', onClick: () => onPanel(panel === 'style' ? null : 'style') },
    { title: 'Full screen', icon: <ExpandIcon className={iconClass} />, onClick: () => { onPanel(null); onFullScreen(); } },
  ];

  return (
    <>
      <div ref={bar} id="dock" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        {/* Three icons fit a phone, so the horizontal dock is used at every width
            instead of Aceternity's collapsed vertical mobile menu. */}
        <FloatingDock items={items} desktopClassName="flex" mobileClassName="hidden" />
      </div>
      <AnimatePresence mode="wait">
        {panel && (
          <motion.div
            key={panel} ref={pop} id="toolPanel" data-panel={panel}
            initial={{ opacity: 0, y: 14, scale: .97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: .97, transition: { duration: .14 } }}
            transition={{ type: 'spring', bounce: .25, duration: .4 }}
            className="fixed bottom-[104px] left-1/2 z-40 w-[min(340px,calc(100vw-32px))] rounded-card border border-line-strong bg-glass-strong p-5 shadow-pop backdrop-blur-2xl"
            style={{ x: '-50%' }}
          >
            {panel === 'style'
              ? <StylePanel {...style} />
              : <AmbientPanel {...ambient} />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
