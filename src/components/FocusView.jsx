import { motion } from 'motion/react';
import { fmt } from '../lib/time';
import { phaseText, startLabel } from '../lib/timerText';
import ClockDisplay from './ClockDisplay';
import Ring, { ringFraction } from './Ring';
import { PauseIcon, PlayIcon } from './icons';
import { Button } from './ui/primitives';

export default function FocusView({ timer, layout, onExit }) {
  const { mode, phase, running, sec, elapsedMs, targetMs } = timer;
  return (
    <motion.div
      id="focusView"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 backdrop-blur-[30px]"
    >
      <motion.div
        initial={{ scale: .94, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: .25, duration: .6 }}
        className="text-center"
      >
        <Ring big fraction={ringFraction(mode, sec, targetMs)}>
          <div className="phase min-h-[18px] text-sm font-medium text-muted">{phaseText(mode, phase, running)}</div>
          <ClockDisplay text={fmt(sec)} layout={layout} />
        </Ring>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={timer.toggle}
            className="flex items-center gap-2 rounded-full bg-accent px-9 py-3 font-bold text-accent-ink shadow-glow transition hover:brightness-105 active:scale-95"
          >
            {running ? <PauseIcon /> : <PlayIcon />}
            <span>{startLabel(running, elapsedMs)}</span>
          </button>
          <Button onClick={onExit} className="px-6">exit</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
