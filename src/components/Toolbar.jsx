import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AMBIENT_TYPES, VIBES } from '../lib/constants';
import { sceneThumb } from '../lib/scenes';
import { cn } from '@/lib/utils';
import { ExpandIcon, MusicIcon, PaletteIcon } from './icons';
import { FloatingDock } from './ui/floating-dock';

const panelTitle = 'mb-3 font-display text-[17px] font-extrabold tracking-[-.01em]';
const label = 'mb-2 text-[12px] font-semibold text-muted';
const amountWord = a => a < 0.05 ? 'off' : a < 0.35 ? 'a little' : a < 0.7 ? 'some' : 'lots';

function StylePanel({ layout, onLayout, vibe, still, onVibe, amount, onAmount, grain, onGrain }) {
  // Painted once per panel open; each tile is the real scene at thumbnail size.
  const thumbs = useMemo(() => Object.fromEntries(VIBES.map(v => [v.key, sceneThumb(v.key)])), []);
  const tile = active => cn(
    'flex flex-1 flex-col items-center gap-2 rounded-panel border p-3 text-[11.5px] text-muted transition hover:-translate-y-0.5',
    active ? 'border-accent bg-accent/15 text-fg' : 'border-line bg-fg/[.04] hover:border-line-strong',
  );
  return (
    <>
      <div className={panelTitle}>vibe</div>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {VIBES.map(v => (
          <button key={v.key} data-vibe={v.key} onClick={() => onVibe(v.key)} aria-pressed={vibe === v.key} className="group text-left">
            <img
              src={thumbs[v.key]} alt=""
              className={cn(
                'block aspect-[3/4] w-full rounded-tile object-cover transition duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-1',
                vibe === v.key ? 'shadow-[0_0_0_2px_rgb(var(--surface)),0_0_0_4px_rgb(var(--accent))]' : 'opacity-90',
              )}
            />
            <span className="mt-1.5 flex items-start gap-1.5 text-[11px] font-semibold leading-tight text-fg">
              <i className="mt-[2px] flex shrink-0">{v.dots.map(d => <b key={d} className="-mr-[3px] h-2 w-2 rounded-full shadow-[0_0_0_1.5px_rgb(var(--surface))]" style={{ background: d }} />)}</i>
              {v.name}
            </span>
          </button>
        ))}
      </div>

      <div className={label}>clock</div>
      <div className="mb-4 flex gap-2.5">
        <button data-layout="classic" className={tile(layout === 'classic')} onClick={() => onLayout('classic')}>
          <div className="font-display text-[22px] font-extrabold text-fg [font-stretch:80%]">25:00</div>classic
        </button>
        <button data-layout="flip" className={tile(layout === 'flip')} onClick={() => onLayout('flip')}>
          <div className="flex gap-1">
            {['25', '00'].map(n => (
              <span key={n} className="rounded-md border border-line bg-glass px-1.5 py-0.5 font-display text-base font-extrabold text-fg [font-stretch:80%]">{n}</span>
            ))}
          </div>flip
        </button>
      </div>

      {still ? (
        <p className="text-[12px] leading-relaxed text-muted">Plain dark keeps the screen still: no moving scene, effect or film grain.</p>
      ) : (<>
      <div className="mb-3">
        <label htmlFor="fxAmount" className={cn(label, 'flex justify-between')}>
          <span>effect amount</span><output className="font-normal">{amountWord(amount)}</output>
        </label>
        <input id="fxAmount" type="range" min="0" max="100" value={Math.round(amount * 100)} onChange={e => onAmount(+e.target.value / 100)} className="w-full" />
      </div>
      <div className="flex items-center justify-between text-[13px] font-semibold">
        <label htmlFor="grainToggle">film grain</label>
        <span className="toggle">
          <input id="grainToggle" type="checkbox" checked={grain} onChange={e => onGrain(e.target.checked)} />
          <span className="toggleTrack" />
        </span>
      </div>
      </>)}
    </>
  );
}

function AmbientPanel({ layers, onToggle, volume, onVolume, vibe, onMix }) {
  const mixOn = vibe.mix.length === layers.length && vibe.mix.every(k => layers.includes(k));
  return (
    <>
      <div className={panelTitle}>ambient sound</div>
      <button
        onClick={onMix} disabled={mixOn}
        className="mb-3 w-full rounded-tile bg-accent px-3 py-2.5 text-[13px] font-bold text-accent-ink transition hover:brightness-105 active:scale-[.98] disabled:opacity-60"
      >
        {mixOn ? `playing the ${vibe.name} mix` : `play the ${vibe.name} mix`}
      </button>
      <div className="grid grid-cols-2 gap-2">
        {AMBIENT_TYPES.map(t => (
          <button
            key={t.key} data-ambient={t.key} onClick={() => onToggle(t.key)} aria-pressed={layers.includes(t.key)}
            className={cn(
              'rounded-tile border px-3 py-2 text-[13px] transition',
              layers.includes(t.key) ? 'border-accent bg-accent/20 text-fg' : 'border-line bg-fg/[.04] text-muted hover:bg-fg/[.08] hover:text-fg',
            )}
          >{t.name.toLowerCase()}</button>
        ))}
      </div>
      <div className="mt-3.5 flex items-center gap-3">
        <label htmlFor="ambientVolume" className="whitespace-nowrap text-xs text-muted">volume</label>
        <input id="ambientVolume" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={e => onVolume(+e.target.value / 100)} />
      </div>
      <p className="mt-2.5 text-[11.5px] leading-relaxed text-muted">Mix as many sounds as you like. They fade out near the end of a session.</p>
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

  const iconClass = 'h-full w-full';
  const items = [
    { title: 'Ambient sound', icon: <MusicIcon className={iconClass} />, active: panel === 'ambient', onClick: () => onPanel(panel === 'ambient' ? null : 'ambient') },
    { title: 'Vibe', icon: <PaletteIcon className={iconClass} />, active: panel === 'style', onClick: () => onPanel(panel === 'style' ? null : 'style') },
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
            className="fixed bottom-[104px] left-1/2 z-40 max-h-[calc(100vh-130px)] w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-card border border-line bg-glass-strong p-5 text-fg shadow-pop backdrop-blur-2xl"
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
