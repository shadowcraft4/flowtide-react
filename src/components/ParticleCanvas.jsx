import { useEffect, useRef } from 'react';
import { createParticleEngine } from '../lib/particles';

/** The effect drawn over the scene. `kind` and `colors` come from the vibe; `amount` from the Style panel. */
export default function ParticleCanvas({ kind, colors, amount }) {
  const canvas = useRef(null);
  const engine = useRef(null);

  useEffect(() => {
    engine.current = createParticleEngine(canvas.current);
    return () => engine.current.destroy();
  }, []);

  useEffect(() => { engine.current.start({ kind, colors, amount }); }, [kind, colors]); // eslint-disable-line react-hooks/exhaustive-deps -- amount has its own effect
  useEffect(() => { engine.current.setAmount(amount); }, [amount]);

  return <canvas id="particleCanvas" ref={canvas} aria-hidden="true" />;
}
