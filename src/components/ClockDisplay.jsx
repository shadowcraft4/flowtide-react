import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Each digit gets its own fixed-width cell (.d) so "1" and "5" take the same
// space and the time never shifts sideways as it counts down.
export function Digits({ str }) {
  return str.split('').map((ch, i) =>
    ch === ':' ? <span key={i} className="flipColonInline">:</span> : <span key={i} className="d">{ch}</span>
  );
}

const SETTLE_MS = 820; // --flip-top-dur (500) + --flip-bottom-dur (280) + margin

// A real flip card: the new top half is revealed as the old top leaf falls away,
// but the old bottom half stays put until the new bottom leaf lands over it.
function FlipGroup({ value }) {
  const [view, setView] = useState({ top: value, bottom: value, leaf: null });
  const prev = useRef(value);
  const seq = useRef(0);
  const settle = useRef(null);

  useLayoutEffect(() => {
    if (prev.current === value) return;
    const old = prev.current;
    prev.current = value;
    clearTimeout(settle.current);
    seq.current += 1;
    setView({ top: value, bottom: old, leaf: { from: old, to: value, key: seq.current } });
    settle.current = setTimeout(() => setView({ top: value, bottom: value, leaf: null }), SETTLE_MS);
  }, [value]);

  useEffect(() => () => clearTimeout(settle.current), []);

  return (
    <div className="flipGroup">
      <div className="half top"><div className="num"><Digits str={view.top} /></div></div>
      <div className="half bottom"><div className="num"><Digits str={view.bottom} /></div></div>
      {view.leaf && (
        <Fragment key={view.leaf.key}>
          <div className="leaf top flipping"><div className="num"><Digits str={view.leaf.from} /></div></div>
          <div className="leaf bottom flipping"><div className="num"><Digits str={view.leaf.to} /></div></div>
        </Fragment>
      )}
    </div>
  );
}

export default function ClockDisplay({ text, layout }) {
  const groups = text.split(':');
  const hrs = groups.length === 3 ? ' hrs' : '';
  if (layout === 'flip') {
    return (
      <div className={`display flipMode${hrs}`}>
        {groups.map((g, i) => (
          // Keyed by group count so switching between mm:ss and h:mm:ss rebuilds the cards.
          <Fragment key={`${groups.length}-${i}`}>
            {i > 0 && <span className="flipColonInline">:</span>}
            <FlipGroup value={g} />
          </Fragment>
        ))}
      </div>
    );
  }
  return <div className={`display${hrs}`}><Digits str={text} /></div>;
}
