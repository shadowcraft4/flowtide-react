import { AuroraBackground } from './ui/aurora-background';
import { BackgroundBeams } from './ui/background-beams';
import { ShootingStars } from './ui/shooting-stars';
import { StarsBackground } from './ui/stars-background';

/**
 * The living background. Most scenes are CSS gradients (see index.css); three use
 * Aceternity components: Aurora, Beams, and Deep Space (twinkling stars + shooting stars).
 */
export default function SceneLayer({ scene }) {
  return (
    <div id="sceneLayer" className={`scene-${scene}`}>
      {scene === 'aurora' && <AuroraBackground />}
      {scene === 'beams' && <BackgroundBeams />}
      {scene === 'space' && (
        <>
          <StarsBackground />
          <ShootingStars starColor="#c9b8ff" trailColor="#8b5cf6" />
        </>
      )}
    </div>
  );
}
