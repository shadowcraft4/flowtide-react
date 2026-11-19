import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import * as audio from '../lib/audio';

/**
 * The timer engine. Running state lives in a ref and time is measured from
 * wall-clock timestamps, so the display stays correct even when a background
 * tab throttles the 200 ms tick. React only re-renders on each tick.
 *
 * `settings` and `onLog` are read through a ref, so the engine always sees
 * the latest values without re-creating its interval.
 */
export function useTimer({ settings, onLog }) {
  const st = useRef({ mode: 'pomodoro', phase: 'focus', running: false, accMs: 0, startedAt: 0, roundCount: 0 });
  const latest = useRef({ settings, onLog });
  latest.current = { settings, onLog };
  const [note, setNote] = useState('');
  const [, force] = useReducer(x => x + 1, 0);

  const api = useMemo(() => {
    const elapsed = () => st.current.accMs + (st.current.running ? Date.now() - st.current.startedAt : 0);

    const targetMs = () => {
      const s = st.current, S = latest.current.settings;
      if (s.mode === 'stopwatch') return Infinity;
      if (s.mode === 'countdown') return S.cd * 60000 + (S.cdSec || 0) * 1000;
      if (s.phase === 'longbreak') return S.longBrk * 60000;
      return (s.phase === 'focus' ? S.focus : S.brk) * 60000;
    };

    const complete = () => {
      const s = st.current, S = latest.current.settings, log = latest.current.onLog;
      // We may notice the end late in a throttled background tab. Keep the
      // overshoot so an auto-started next phase begins when this one actually ended.
      const overshoot = Math.max(0, elapsed() - targetMs());
      s.accMs = 0; s.running = false; s.startedAt = 0;
      if (s.mode === 'countdown') {
        log(S.cd * 60, 'countdown');
        setNote('Countdown finished and logged.');
      } else if (s.phase === 'focus') {
        log(S.focus * 60, 'focus');
        s.roundCount++;
        s.phase = s.roundCount % S.longEvery === 0 ? 'longbreak' : 'break';
        setNote(s.phase === 'longbreak' ? `Nice work. Long break: ${S.longBrk} min.` : `Focus logged. Break: ${S.brk} min.`);
      } else {
        s.phase = 'focus';
        setNote('Break over.');
      }
      if (S.sound) audio.chime();
      audio.resetFade();
      if (S.auto && s.mode === 'pomodoro') {
        s.startedAt = Date.now() - Math.min(overshoot, targetMs() - 1000);
        s.running = true;
      }
      force();
    };

    const tick = () => {
      const s = st.current;
      if (!s.running) return;
      if (s.mode !== 'stopwatch') {
        const remaining = targetMs() - elapsed();
        if (remaining <= 0) { complete(); return; }
        audio.maybeFade(Math.ceil(remaining / 1000), s.mode);
      }
      force();
    };

    return {
      elapsed,
      targetMs,
      tick,
      toggle() {
        const s = st.current;
        if (s.running) {
          s.accMs = elapsed(); s.running = false; s.startedAt = 0;
        } else {
          if (s.mode !== 'stopwatch' && elapsed() >= targetMs()) s.accMs = 0;
          s.startedAt = Date.now(); s.running = true;
          audio.resetFade();
          setNote('');
        }
        force();
      },
      reset() {
        const s = st.current;
        s.running = false; s.accMs = 0; s.startedAt = 0;
        audio.resetFade();
        if (s.mode === 'pomodoro') { s.phase = 'focus'; s.roundCount = 0; }
        setNote('');
        force();
      },
      finish() {
        const s = st.current;
        const sec = Math.round(elapsed() / 1000);
        const countable = s.mode === 'stopwatch' || s.mode === 'countdown' || (s.mode === 'pomodoro' && s.phase === 'focus');
        s.running = false; s.accMs = 0; s.startedAt = 0;
        if (countable && sec >= 60) { latest.current.onLog(sec, s.mode); setNote(`Logged ${Math.round(sec / 60)} min.`); }
        else if (countable) setNote('Under a minute, so nothing was logged.');
        else setNote('Break time is not logged.');
        force();
      },
      setMode(m) {
        Object.assign(st.current, { mode: m, phase: 'focus', running: false, accMs: 0, startedAt: 0, roundCount: 0 });
        setNote('');
        force();
      },
      /** Restarts the current countdown from the top (used when its length changes). */
      clearProgress() {
        st.current.accMs = 0; st.current.startedAt = 0;
        force();
      },
    };
  }, []);

  useEffect(() => {
    const id = setInterval(api.tick, 200);
    document.addEventListener('visibilitychange', api.tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', api.tick); };
  }, [api]);

  const s = st.current;
  const elapsedMs = api.elapsed();
  const target = api.targetMs();
  const sec = s.mode === 'stopwatch' ? Math.floor(elapsedMs / 1000) : Math.max(0, Math.ceil((target - elapsedMs) / 1000));

  return {
    mode: s.mode,
    phase: s.phase,
    running: s.running,
    elapsedMs,
    targetMs: target,
    sec,
    note,
    toggle: api.toggle,
    reset: api.reset,
    finish: api.finish,
    setMode: api.setMode,
    clearProgress: api.clearProgress,
  };
}
