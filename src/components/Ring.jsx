import { useEffect, useRef } from 'react';
import { RING_RADIUS } from '../lib/constants';

const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Fraction of the ring to fill: time remaining for timers, seconds into the current minute for the stopwatch. */
export function ringFraction(mode, sec, targetMs) {
  if (mode === 'stopwatch') return (sec % 60) / 60;
  const target = Math.max(1, Math.round(targetMs / 1000));
  return Math.max(0, Math.min(1, sec / target));
}

export default function Ring({ fraction, big = false, className = '', children }) {
  const prev = useRef(null);
  // A big drop (stopwatch lapping :59 → :00) must snap, not sweep backwards round the ring.
  const snap = prev.current != null && fraction < prev.current - 0.5;
  useEffect(() => { prev.current = fraction; });

  return (
    <div className={`ringWrap${big ? ' big' : ''}${className ? ' ' + className : ''}`}>
      <svg className="ringSvg" viewBox="0 0 300 300">
        <circle className="ringTrack" cx="150" cy="150" r={RING_RADIUS} />
        <circle
          className="ringProgress"
          cx="150" cy="150" r={RING_RADIUS}
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: CIRCUMFERENCE * (1 - fraction),
            transition: snap ? 'none' : undefined,
          }}
        />
      </svg>
      <div className="ringInner">{children}</div>
    </div>
  );
}
