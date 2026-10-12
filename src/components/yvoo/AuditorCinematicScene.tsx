import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUDITOR_JOURNEY_CHAPTERS, auditorJourneyFrame } from "./auditor-journey";

const sceneHeight = (steps: number) => window.innerHeight * (1.5 + (steps - 1) * 1.1);
const sceneSteps = (scene: HTMLElement) => Number(scene.dataset['steps'] || 1);
const sceneOffset = (scenes: HTMLElement[], index: number) => scenes.slice(0, index).reduce((sum, scene) => sum + sceneHeight(sceneSteps(scene)), 0);

/** Scenes with steps stay pinned; scrolling advances one step at a time. */
export function AuditorCinematicScene({ children, className = "ap-section", id, steps = 1 }: { children: ReactNode; className?: string; id?: string; steps?: number }) {
  return <section className="ap-scene" id={id} data-steps={steps}><div className={`ap-scene-stage ${className}`}><div className="ap-scene-content">{children}</div></div></section>;
}

export function useAuditorCinema() {
  const root = useRef<HTMLElement>(null);
  const journey = useRef(0);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const scenes = Array.from(element.querySelectorAll<HTMLElement>(".ap-scene"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, lastActive = -1, currentScroll = window.scrollY, lastTime = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, .05);
      lastTime = now;
      currentScroll += (window.scrollY - currentScroll) * (reduce.matches ? 1 : 1 - Math.exp(-9 * dt));
      let rest = Math.max(0, currentScroll), position = 0;
      for (let i = 0; i < scenes.length; i++) { const h = sceneHeight(sceneSteps(scenes[i]!)); if (rest < h || i === scenes.length - 1) { position = i + Math.min(i === scenes.length - 1 ? .45 : .56, rest / h); break; } rest -= h; }
      journey.current = position;
      const current = Math.min(scenes.length - 1, Math.floor(position + .13));
      scenes.forEach((scene, index) => {
        const score = auditorJourneyFrame(position, index, reduce.matches);
        const stage = scene.firstElementChild as HTMLElement | null;
        const steps = sceneSteps(scene);
        scene.style.height = `${sceneHeight(steps)}px`;
        if (steps > 1 && stage) {
          const step = Math.min(steps - 1, Math.max(0, Math.floor((position - index) / .58 * steps)));
          if (stage.dataset['step'] !== String(step)) {
            stage.dataset['step'] = String(step);
            stage.querySelectorAll<HTMLElement>("[data-step-item]").forEach(item => {
              const n = Number(item.dataset['stepItem']);
              item.classList.toggle("is-current", n === step);
              item.classList.toggle("is-done", n < step);
            });
            stage.style.setProperty("--step-progress", String(step / (steps - 1)));
          }
        }
        if (stage) {
          stage.style.visibility = score.textOpacity > .001 ? "visible" : "hidden";
          stage.style.opacity = String(score.textOpacity);
          stage.style.pointerEvents = score.textOpacity > .6 ? "auto" : "none";
          stage.style.setProperty("--text-y", `${score.textY}px`);
          stage.style.setProperty("--text-scale", String(score.textScale));
          stage.style.setProperty("--fill", score.fill.toFixed(3));
          stage.classList.toggle("is-on", score.textOpacity > .6);
        }
        element.style.setProperty(`--tint-${index}`, score.tint.toFixed(3));
        element.querySelector<HTMLElement>(`[data-chapter="${index}"]`)?.style.setProperty("--chapter-progress", `${score.progress * 360}deg`);
      });
      if (lastActive !== current) { lastActive = current; setActive(current); }
      element.style.setProperty("--journey", String(position));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // Stepped scenes advance exactly one step per wheel gesture while the page holds.
    let lock = 0, target = -1;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 4) return;
      const now = performance.now();
      if (target >= 0 && Math.abs(window.scrollY - target) > 3 && now < lock + 600) { event.preventDefault(); return; }
      target = -1;
      let offset = 0;
      for (let i = 0; i < scenes.length; i++) {
        const steps = sceneSteps(scenes[i]!), h = sceneHeight(steps);
        const local = (window.scrollY - offset) / h;
        if (window.scrollY < offset + h) {
          if (steps < 2 || local > .6) return;
          const step = Math.min(steps - 1, Math.max(0, Math.floor(local / .58 * steps)));
          const next = step + Math.sign(event.deltaY);
          if (next < 0 || next >= steps) return;
          event.preventDefault();
          if (now < lock) return;
          lock = now + 750;
          target = Math.round(offset + h * ((next + .5) / steps) * .58);
          window.scrollTo({ top: target, behavior: reduce.matches ? "instant" : "smooth" });
          return;
        }
        offset += h;
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("wheel", onWheel); };
  }, []);
  const jump = (index: number) => window.scrollTo({ top: sceneOffset(Array.from(root.current?.querySelectorAll<HTMLElement>(".ap-scene") ?? []), index), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  return { root, active, jump, journey };
}

export function AuditorChapterNavigation({ active, jump }: { active: number; jump: (index: number) => void }) {
  return <><nav className="ap-chapter-nav" aria-label="Walkthrough chapters">{AUDITOR_JOURNEY_CHAPTERS.map((name, index) => <Button key={name} variant="ghost" size="icon" data-chapter={index} className={`ap-chapter-dot ${active === index ? "is-active" : ""}`} onClick={() => jump(index)} aria-label={name} aria-current={active === index ? "step" : undefined} title={name}><i /><span>{name}</span></Button>)}</nav><div className="ap-chapter-labels" aria-hidden="true">{AUDITOR_JOURNEY_CHAPTERS.slice(active, active + 3).map((name, i) => <span key={name} className={i === 0 ? "is-active" : ""}>{name}</span>)}</div>{active < AUDITOR_JOURNEY_CHAPTERS.length - 1 && <Button className="ap-next-scene" variant="cinematicGhost" size="icon" aria-label="Next chapter" title="Next chapter" onClick={() => jump(active + 1)}><ArrowDown /></Button>}</>;
}
