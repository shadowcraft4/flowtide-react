import { useEffect, useRef } from 'react';
import { createSceneEngine } from '../lib/scenes';

/** The vibe's painted, animated background. Switching vibes cross-fades between two canvases. */
export default function SceneLayer({ scene }) {
  const a = useRef(null);
  const b = useRef(null);
  const engine = useRef(null);

  useEffect(() => {
    engine.current = createSceneEngine([a.current, b.current]);
    return () => engine.current.destroy();
  }, []);

  useEffect(() => { engine.current.setScene(scene); }, [scene]);

  return (
    <div id="sceneLayer" aria-hidden="true">
      <canvas ref={a} className="sceneCanvas" />
      <canvas ref={b} className="sceneCanvas off" />
      <div id="sceneScrim" />
    </div>
  );
}
