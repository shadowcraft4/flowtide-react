import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as audio from './lib/audio';
import { AMBIENT_TYPES, DATA_KEY, DEF_SETTINGS, INTERVALS, SESSIONS_KEY, SUBJECT_PRESETS, applyVibeTokens, vibeByKey } from './lib/constants';
import { computeStats } from './lib/stats';
import { read, store } from './lib/storage';
import { fmt, todayKey, uid } from './lib/time';
import { usePersistentState } from './hooks/usePersistentState';
import { useTimer } from './hooks/useTimer';
import FocusView from './components/FocusView';
import ParticleCanvas from './components/ParticleCanvas';
import SettingsView from './components/SettingsView';
import StatsView from './components/StatsView';
import TimerView from './components/TimerView';
import Toolbar from './components/Toolbar';
import SceneLayer from './components/SceneLayer';
import { FlowtideMark } from './components/icons';
import { Segmented } from './components/ui/primitives';

const VIEWS = [
  { key: 'timer', name: 'timer' },
  { key: 'stats', name: 'stats' },
  { key: 'settings', name: 'settings' },
];

function loadData() {
  const saved = read(DATA_KEY, {});
  return {
    tasks: [], labels: [], currentTask: null, selLabel: '',
    ...saved,
    settings: { ...DEF_SETTINGS, ...(saved.settings || {}) },
  };
}

// The active preset chip is derived from the saved durations, so a custom
// 40/8 set in Settings stays custom instead of snapping back to 25/5.
function matchInterval(S) {
  for (const [key, v] of Object.entries(INTERVALS)) {
    if (S.focus === v.focus && S.brk === v.brk && S.longBrk === v.longBrk && S.longEvery === v.longEvery) return key;
  }
  return 'custom';
}

export default function App() {
  const [sessions, setSessions] = usePersistentState(SESSIONS_KEY, []);
  const [data, setData] = useState(loadData);
  useEffect(() => { store(DATA_KEY, data); }, [data]);

  const [layout, setLayout] = usePersistentState('flowtide.clockLayout', 'flip');
  const [vibeKey, setVibeKey] = usePersistentState('flowtide.vibe', 'lofi');
  const [fxAmount, setFxAmount] = usePersistentState('flowtide.fxAmount', 0.55);
  const [grain, setGrain] = usePersistentState('flowtide.grain', true);
  const vibe = vibeByKey(vibeKey);
  // Before paint, so a saved vibe never flashes the default colours first.
  useLayoutEffect(() => { applyVibeTokens(vibe); }, [vibe]);
  const [ambientLayers, setAmbientLayers] = usePersistentState('flowtide.ambientLayers', []);
  const [volume, setVolume] = usePersistentState('flowtide.ambientVolume', 0.6);

  const [view, setView] = useState('timer');
  const [fullView, setFullViewState] = useState(false);
  const [panel, setPanel] = useState(null);
  const [focusDuration, setFocusDuration] = useState(false);

  const S = data.settings;
  const currentTaskText = data.tasks.find(t => t.id === data.currentTask && !t.done)?.text || '';

  const timer = useTimer({
    settings: S,
    onLog: (seconds, kind) => setSessions(prev => [...prev, {
      seconds, kind, date: todayKey(), label: data.selLabel || null, task: currentTaskText || null,
    }]),
  });

  const stats = useMemo(() => computeStats(sessions, data.labels, S.goal), [sessions, data.labels, S.goal]);

  // ---- Ambient sound: restore the saved mix once on load ----
  useEffect(() => {
    audio.setVolume(volume);
    audio.restoreLayers(ambientLayers);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once with the saved values

  const toggleLayer = key => setAmbientLayers(audio.toggleLayer(key));
  const changeVolume = v => { setVolume(v); audio.setVolume(v); };
  const playMix = () => setAmbientLayers(audio.setLayers(vibe.mix));

  // ---- Data updates ----
  const updateSettings = patch => setData(d => ({ ...d, settings: { ...d.settings, ...patch } }));

  const pickSubject = name => setData(d => {
    let label = d.labels.find(l => l.name.toLowerCase() === name.toLowerCase());
    let labels = d.labels;
    if (!label) {
      const preset = SUBJECT_PRESETS.find(p => p.name === name);
      label = { id: uid(), name, color: preset ? preset.color : '#8b5cf6' };
      labels = [...labels, label];
    }
    return { ...d, labels, selLabel: label.id };
  });

  const taskActions = {
    onAdd: text => setData(d => ({ ...d, tasks: [...d.tasks, { id: uid(), text, done: false }] })),
    onSetDone: (id, done) => setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, done } : t) })),
    onDelete: id => setData(d => ({
      ...d, tasks: d.tasks.filter(t => t.id !== id), currentTask: d.currentTask === id ? null : d.currentTask,
    })),
    onPick: id => setData(d => ({ ...d, currentTask: d.currentTask === id ? null : id })),
  };

  const addLabel = (name, color) => setData(d => ({ ...d, labels: [...d.labels, { id: uid(), name, color }] }));
  const deleteLabel = id => setData(d => ({
    ...d, labels: d.labels.filter(l => l.id !== id), selLabel: d.selLabel === id ? '' : d.selLabel,
  }));

  const clearData = () => {
    setSessions([]);
    setData(d => ({ ...d, tasks: [], currentTask: null }));
    timer.reset();
  };

  // ---- Timer controls ----
  const chooseInterval = key => {
    if (key === 'custom') { setView('settings'); setFocusDuration(true); return; }
    updateSettings(INTERVALS[key]);
    timer.reset();
  };

  const choosePreset = min => {
    if (timer.running) return;
    updateSettings({ cd: min, cdSec: 0 });
    timer.clearProgress();
  };

  const focusDurationDone = useCallback(() => setFocusDuration(false), []);

  // ---- Full screen: the overlay plus the real browser Fullscreen API ----
  const setFullView = useCallback(on => {
    setFullViewState(on);
    const de = document.documentElement;
    if (on && !document.fullscreenElement && de.requestFullscreen) de.requestFullscreen().catch(() => {});
    if (!on && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullViewState(false); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ---- Keyboard shortcuts (handler kept in a ref so it always sees current state) ----
  const onKey = useRef(null);
  onKey.current = e => {
    if (e.key === 'Escape' && fullView) { setFullView(false); return; }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    // Space always means start/pause — otherwise it re-clicks whichever button was last focused.
    if (e.code === 'Space') { e.preventDefault(); timer.toggle(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'r' || e.key === 'R') timer.reset();
    else if (e.key === 'f' || e.key === 'F') setFullView(!fullView);
  };
  useEffect(() => {
    const handler = e => onKey.current(e);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.title = (timer.running ? fmt(timer.sec) + ' · ' : '') + 'Flowtide';
  });

  return (
    <>
      <SceneLayer scene={vibe.key} />
      <ParticleCanvas kind={vibe.fx} colors={vibe.fxColors} amount={fxAmount} />
      <div id="grain" className={grain && !vibe.still ? '' : 'off'} />

      <header className="relative z-10 mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-3 px-4 pb-2 pt-5 sm:px-6">
        <div className="flex items-center gap-2.5 font-display text-[23px] font-extrabold tracking-[-.035em] text-fg [font-stretch:85%]">
          <FlowtideMark className="h-7 w-7" />flowtide
        </div>
        <nav>
          <Segmented
            id="nav" dataAttr="view" options={VIEWS} value={view} onChange={setView}
            className="border-line bg-glass backdrop-blur-xl" pillClassName="bg-fg" activeClassName="text-ink"
          />
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-[760px] px-4 pb-36 pt-4 sm:px-6">
        {/* Keyed by view so each page switch replays the fade-and-slide entrance. */}
        <section data-section={view} className="viewEnter" key={view}>
          {view === 'timer' && (
            <TimerView
              timer={timer} settings={S} layout={layout} sticker={vibe.sticker}
              intervalKey={matchInterval(S)} onInterval={chooseInterval} onPreset={choosePreset}
              onFullScreen={() => setFullView(true)}
              stats={stats} labels={data.labels} selLabel={data.selLabel}
              onPickSubject={pickSubject} onClearSubject={() => setData(d => ({ ...d, selLabel: '' }))}
              tasks={data.tasks} currentTask={data.currentTask} currentTaskText={currentTaskText} taskActions={taskActions}
            />
          )}
          {view === 'stats' && <StatsView stats={stats} sessions={sessions} labels={data.labels} goal={S.goal} />}
          {view === 'settings' && (
            <SettingsView
              settings={S} onSettings={updateSettings}
              labels={data.labels} onAddLabel={addLabel} onDeleteLabel={deleteLabel}
              onClearData={clearData}
              focusDuration={focusDuration} onFocusDurationDone={focusDurationDone}
            />
          )}
        </section>
      </div>

      {fullView && <FocusView timer={timer} layout={layout} onExit={() => setFullView(false)} />}

      {ambientLayers.length > 0 && !fullView && (
        <div className="fixed bottom-5 left-5 z-30 hidden -rotate-[1.5deg] items-center gap-2.5 rounded-[14px] border border-line bg-glass py-2 pl-2.5 pr-3.5 text-[12.5px] text-fg backdrop-blur-xl lg:flex">
          <span className="flex h-[18px] w-[22px] items-end gap-[2px]" aria-hidden="true">
            {[0, -0.4, -0.8, -0.2].map(d => <i key={d} className="h-[30%] flex-1 animate-eq rounded-[2px] bg-accent" style={{ animationDelay: d + 's' }} />)}
          </span>
          <div>
            <small className="block text-[11px] text-muted">now playing</small>
            <b className="font-bold">{ambientLayers.map(k => AMBIENT_TYPES.find(t => t.key === k)?.name.toLowerCase()).filter(Boolean).join(' + ')}</b>
          </div>
        </div>
      )}

      <Toolbar
        panel={panel} onPanel={setPanel} onFullScreen={() => setFullView(true)}
        style={{ layout, onLayout: setLayout, vibe: vibe.key, still: !!vibe.still, onVibe: setVibeKey, amount: fxAmount, onAmount: setFxAmount, grain, onGrain: setGrain }}
        ambient={{ layers: ambientLayers, onToggle: toggleLayer, volume, onVolume: changeVolume, vibe, onMix: playMix }}
      />
    </>
  );
}
