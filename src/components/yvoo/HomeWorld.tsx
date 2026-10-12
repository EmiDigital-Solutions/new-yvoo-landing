import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

import { WalkthroughWorld } from "./WalkthroughWorld";
import { YvooWorld } from "./YvooWorld";
import { WALK_START, WALK_END, WALK_MAX, HOME_CHAPTER_STARTS } from "./home-scene-timeline";

/** Walk fractions where the headline changes; the camera crosses each photo exactly there. */
const WALK_SYNC = HOME_CHAPTER_STARTS.slice(3, 7).map((at) => (at - WALK_START) / (WALK_END - WALK_START));

/** Hero (original scene) → scanner walkthrough → back to the original scene from "Atlas runs the loop". */

export function HomeWorld({ progress, onReady }: { progress: MutableRefObject<number>; onReady: () => void }) {
  const yvooProgress = useRef(0);
  const walkProgress = useRef(0);
  const [inWalk, setInWalk] = useState(false);
  const readyCount = useRef(0);
  const markReady = useCallback(() => {
    readyCount.current += 1;
    if (readyCount.current >= 2) onReady();
  }, [onReady]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = progress.current;
      const walk = p > WALK_START && p < WALK_END;
      walkProgress.current = Math.min(Math.max((p - WALK_START) / (WALK_END - WALK_START), 0), 1) * WALK_MAX;
      yvooProgress.current = p <= WALK_START ? 0 : p;
      setInWalk((prev) => (prev === walk ? prev : walk));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const layer = (on: boolean) => ({ position: "absolute" as const, inset: 0, opacity: on ? 1 : 0, transition: "opacity .7s ease" });
  return (
    <>
      <div style={layer(!inWalk)}><YvooWorld progress={yvooProgress} story={progress} onReady={markReady} active={!inWalk} /></div>
      <div style={layer(inWalk)}><WalkthroughWorld progress={walkProgress} onReady={markReady} active={inWalk} sync={WALK_SYNC} /></div>
    </>
  );
}
