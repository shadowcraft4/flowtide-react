import { motion } from 'motion/react';
import { fmt } from '../lib/time';
import { phaseText, startLabel } from '../lib/timerText';
import ClockDisplay from './ClockDisplay';
import Ring, { ringFraction } from './Ring';
import { PauseIcon, PlayIcon } from './icons';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { Button } from './ui/primitives';

export default function FocusView({ timer, layout, onExit }) {
  const { mode, phase, running, sec, elapsedMs, targetMs } = timer;
  return (
    <motion.div
      id="focusView"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(5,5,9,.76)] backdrop-blur-[30px]"
    >
      <motion.div
        initial={{ scale: .94, y: 12 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', bounce: .25, duration: .6 }}
        className="text-center"
      >
        <Ring big fraction={ringFraction(mode, sec, targetMs)}>
          <div className="phase min-h-[18px] text-sm font-medium uppercase tracking-[.04em] text-muted">{phaseText(mode, phase, running)}</div>
          <ClockDisplay text={fmt(sec)} layout={layout} />
        </Ring>
        <div className="mt-6 flex justify-center gap-3">
          <HoverBorderGradient
            as="button" onClick={timer.toggle}
            containerClassName="rounded-full shadow-glow"
            className="flex items-center gap-2 bg-gradient-to-br from-accent-soft/80 via-accent to-accent-deep px-9 py-3 font-semibold text-white"
          >
            {running ? <PauseIcon /> : <PlayIcon />}
            <span>{startLabel(running, elapsedMs)}</span>
          </HoverBorderGradient>
          <Button onClick={onExit} className="px-6">Exit</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
