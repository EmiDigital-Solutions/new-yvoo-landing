import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { explainStep, EXPLAIN_ROLES } from "@/lib/explain-step.functions";
import v1 from "@/assets/orbit-impeller/v1.png";
import v2 from "@/assets/orbit-impeller/v2.png";
import v3 from "@/assets/orbit-impeller/v3.png";
import v4 from "@/assets/orbit-impeller/v4.png";
import { orbitMorph } from "./orbit-morph";
import { OrbitDna } from "./OrbitDna";

const views = [v1, v2, v3, v4];

/** Pioneer-style orbit: a stainless part spins in the centre, four steps circle it like satellites. */
export const orbitSteps = [
  { k: "Level 1", t: "Digital audit", d: "The supplier uploads every document and proof. Atlas checks each one for gaps, expiry and plausibility." },
  { k: "Level 2", t: "Guided self-audit", d: "The supplier runs a full audit with the same checklist an auditor would use, guided step by step by Atlas." },
  { k: "Level 3", t: "On-site verification", d: "An independent YVOO auditor checks on site only what is still unproven." },
  { k: "CAPA", t: "Corrective actions", d: "Every finding becomes a tracked action. The supplier is released once the actions are closed." },
];


export function VerificationOrbit({ active, step, onPick }: { active: boolean; step: number; progress: number; onPick: (i: number) => void }) {
  const current = orbitSteps[step] ?? orbitSteps[0];
  const angleFor = (i: number) => Math.PI / 2 + i * (Math.PI / 2);
  const [t, setT] = useState(() => angleFor(step));
  const base = useRef(angleFor(step));
  const wanted = useRef(step);
  wanted.current = step;
  // Smooth follow: one continuous exponential glide toward the target angle, so chained steps never stop and restart.
  useEffect(() => {
    if (!active) { base.current = angleFor(wanted.current); setT(base.current); return; }
    let id = 0; let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const target = angleFor(wanted.current);
      const diff = target - base.current;
      if (Math.abs(diff) > 0.0005) { base.current += diff * (1 - Math.exp(-5 * dt)); setT(base.current); }
      else if (diff !== 0) { base.current = target; setT(target); }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active]);
  const [role, setRole] = useState(EXPLAIN_ROLES[0] ?? "Quality director");
  const [ai, setAi] = useState<{ key: string; text?: string; error?: string; loading?: boolean } | null>(null);
  const aiKey = `${step}|${role}`;
  const ask = async () => {
    setAi({ key: aiKey, loading: true });
    try {
      const r = await explainStep({ data: { step, role } });
      setAi(r.ok ? { key: aiKey, text: r.text } : { key: aiKey, error: r.error });
    } catch { setAi({ key: aiKey, error: "The explanation could not be generated." }); }
  };
  const shownStep = Math.max(0, Math.min(3, Math.round((t - Math.PI / 2) / (Math.PI / 2))));
  const visualLevel = Math.max(0, Math.min(3, (t - Math.PI / 2) / (Math.PI / 2)));
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return (
    <aside className={`v-orbit ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <div className="v-orbit-stage">
        <svg className="v-orbit-ring" viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="100" rx="96" ry="26" /></svg>
        <div className="v-orbit-object" style={{ ["--part-reveal" as string]: orbitMorph(visualLevel, reducedMotion).photo }}>{active && <OrbitDna src={v1} progress={visualLevel} reducedMotion={reducedMotion} />}{views.map((src, i) => <img key={i} src={src} alt={i === 0 ? "3D-printed titanium turbine impeller" : ""} className={i === shownStep ? "is-on" : i < shownStep ? "is-past" : ""} />)}</div>
        {orbitSteps.map((s, i) => {
          const a = t - (i / 4) * Math.PI * 2;
          const front = Math.sin(a);
          return (
            <Button variant="ghost" key={s.k} type="button" tabIndex={active ? 0 : -1}
              className={`v-orbit-point ${i === step ? "is-on" : i < step ? "is-past" : ""}`}
              style={{ left: `${50 + Math.cos(a) * 48}%`, top: `${50 + front * 13}%`, zIndex: front > 0 ? 3 : 1, opacity: 0.45 + (front + 1) * 0.275, transform: `scale(${0.75 + (front + 1) * 0.15})` }}
              onClick={() => onPick(i)} aria-label={`${s.k} ${s.t}`}>
              <i /><span>{s.k}</span>
            </Button>
          );
        })}
      </div>
      <div className="v-orbit-copy" key={step}>
        <small>{current?.k} · Step {step + 1} of 4</small>
        <strong>{current?.t}</strong>
        <p>{current?.d}</p>
        <div className="v-orbit-ai">
          <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Your role" tabIndex={active ? 0 : -1}>{EXPLAIN_ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          <Button variant="cinematicGhost" size="sm" onClick={ask} disabled={ai?.key === aiKey && ai.loading} tabIndex={active ? 0 : -1}>{ai?.key === aiKey && ai.loading ? "Atlas is thinking…" : "Explain for my role"}</Button>
        </div>
        {ai?.key === aiKey && (ai.text || ai.error) && <p className={`v-orbit-ai-text ${ai.error ? "is-error" : ""}`}>{ai.text ?? ai.error}</p>}
      </div>
    </aside>
  );
}
