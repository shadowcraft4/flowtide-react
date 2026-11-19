import { useEffect, useRef } from 'react';
import { createParticleEngine } from '../lib/particles';

export default function ParticleCanvas({ type }) {
  const canvas = useRef(null);
  const engine = useRef(null);

  useEffect(() => {
    engine.current = createParticleEngine(canvas.current);
    return () => engine.current.destroy();
  }, []);

  useEffect(() => { engine.current.start(type); }, [type]);

  return <canvas id="particleCanvas" ref={canvas} />;
}
