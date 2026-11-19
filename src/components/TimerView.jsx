import { COUNTDOWN_PRESETS, EXAM_PRESETS, INTERVAL_CHIPS } from '../lib/constants';
import { fmt } from '../lib/time';
import { phaseText, startLabel, summaryText } from '../lib/timerText';
import { cn } from '@/lib/utils';
import ClockDisplay from './ClockDisplay';
import Ring, { ringFraction } from './Ring';
import SubjectPicker from './SubjectPicker';
import StreakMini from './StreakMini';
import TaskCard from './TaskCard';
import { PauseIcon, PlayIcon } from './icons';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { Button, Segmented } from './ui/primitives';

const MODES = [
  { key: 'pomodoro', name: 'Pomodoro' },
  { key: 'countdown', name: 'Countdown' },
  { key: 'stopwatch', name: 'Stopwatch' },
];

export default function TimerView({
  timer, settings, layout, intervalKey, onInterval, onPreset, onFullScreen,
  stats, labels, selLabel, onPickSubject, onClearSubject,
  tasks, currentTask, currentTaskText, taskActions,
}) {
  const { mode, phase, running, sec, elapsedMs, targetMs, note } = timer;

  return (
    <div className="relative mx-auto max-w-[620px] text-center">
      <Segmented
        id="mode" dataAttr="mode" options={MODES} value={mode} onChange={timer.setMode}
        className="mb-5"
        pillClassName="bg-gradient-to-br from-accent-soft/90 via-accent to-accent shadow-chip"
      />

      {mode === 'pomodoro' && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {INTERVAL_CHIPS.map(c => (
            <button
              key={c.key} data-interval={c.key} onClick={() => onInterval(c.key)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-tile border px-4 py-2 text-[13px] transition duration-200',
                intervalKey === c.key
                  ? 'border-accent/55 bg-accent/15 text-fg shadow-[inset_0_0_0_1px_rgba(139,92,246,.15)]'
                  : 'border-line bg-white/[.03] text-muted hover:bg-white/[.06] hover:text-fg',
              )}
            >
              <b className="font-semibold">{c.name}</b>
              <span className="text-[11px] opacity-75">{c.sub}</span>
            </button>
          ))}
        </div>
      )}

      {mode === 'countdown' && (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap justify-center gap-2">
            {COUNTDOWN_PRESETS.map(p => (
              <Button key={p.min} data-preset={p.min} onClick={() => onPreset(p.min)}>{p.label}</Button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5">
            {EXAM_PRESETS.map(p => (
              <Button key={p.min} data-preset={p.min} className="px-3 py-1.5 text-xs" onClick={() => onPreset(p.min)}>{p.label}</Button>
            ))}
          </div>
        </div>
      )}

      {/* Keyed by mode so switching modes replays the cross-fade. */}
      <Ring key={mode} className="viewEnter" fraction={ringFraction(mode, sec, targetMs)}>
        <div className="phase min-h-[18px] text-[13px] font-medium uppercase tracking-[.04em] text-muted">{phaseText(mode, phase, running)}</div>
        <ClockDisplay text={fmt(sec)} layout={layout} />
      </Ring>

      <div className="summary mb-1 min-h-4 text-[11.5px] text-muted">{summaryText(mode, settings)}</div>
      {currentTaskText && (
        <div className="focusTask mx-auto mb-2.5 mt-0.5 inline-block max-w-[90%] truncate rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[12.5px] text-accent-soft">
          Focusing on: {currentTaskText}
        </div>
      )}

      <div className="my-4 flex justify-center">
        <HoverBorderGradient
          as="button" onClick={timer.toggle} data-action="toggle"
          containerClassName="rounded-full shadow-glow"
          className="flex items-center gap-2 bg-gradient-to-br from-accent-soft/80 via-accent to-accent-deep px-12 py-3.5 text-base font-semibold text-white"
        >
          {running ? <PauseIcon /> : <PlayIcon />}
          <span>{startLabel(running, elapsedMs)}</span>
        </HoverBorderGradient>
      </div>

      <div className="mb-2.5 flex flex-wrap justify-center gap-2.5">
        <Button onClick={timer.reset}>Reset</Button>
        <Button onClick={timer.finish}>Log &amp; finish</Button>
        <Button onClick={onFullScreen}>Full screen</Button>
      </div>

      <div className="mt-3.5 flex justify-center">
        <SubjectPicker labels={labels} selLabel={selLabel} onPick={onPickSubject} onClear={onClearSubject} />
      </div>
      <p className="note mt-2.5 min-h-5 text-sm text-muted">{note}</p>

      <StreakMini streak={stats.streak} goalPct={stats.goalPct} goalReached={stats.goalReached} />
      <TaskCard tasks={tasks} currentTask={currentTask} {...taskActions} />
    </div>
  );
}
