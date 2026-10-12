import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import orderImage from "@/assets/atlas-reference/order.jpg.asset.json";
import auditImage from "@/assets/atlas-reference/audit.jpg.asset.json";
import reportImage from "@/assets/atlas-reference/report.jpg.asset.json";
import orderVideo from "@/assets/atlas-reference/order.webm.asset.json";
import auditVideo from "@/assets/atlas-reference/audit.webm.asset.json";
import reportVideo from "@/assets/atlas-reference/report.webm.asset.json";

/** Cinematic focus keyframes per recording: time (s), focus x/y (0–1 of frame), zoom. */
type Focus = [number, number, number, number];
const WIDE: Focus[] = [[0, .5, .5, 1]];
const focusTracks: Focus[][] = [
  [[0, .5, .5, 1], [4, .5, .5, 1.04], [5.5, .4, .7, 2.1], [8.5, .36, .3, 1.9], [13, .5, .5, 1.05], [20, .4, .45, 1.8], [29, .4, .7, 2.1], [38, .5, .5, 1.05], [45, .36, .66, 1.9], [53, .5, .5, 1.05], [60, .4, .6, 1.8], [69, .5, .5, 1]],
  [[0, .5, .5, 1], [3.5, .5, .36, 1.9], [11, .5, .5, 1.05], [12.5, .84, .45, 1.8], [17, .5, .5, 1.05], [18.5, .5, .9, 1.8], [22, .5, .5, 1]],
  [[0, .5, .5, 1], [3, .72, .17, 2.2], [9, .5, .5, 1.05], [10.5, .45, .25, 1.8], [18, .5, .5, 1.1], [22, .45, .4, 1.6], [31, .45, .56, 1.6], [39, .5, .5, 1.12], [46, .5, .5, 1]],
];
function focusAt(track: Focus[], t: number): Focus {
  let current = track[0] ?? WIDE[0]!;
  for (const k of track) if (k[0] <= t) current = k;
  return current;
}

const windows = [
  { label: "Order", title: "Tell Atlas what you need", image: auditImage.url, video: auditVideo.url, alt: "Actual Atlas order conversation with supplier matching and an audit brief" },
  { label: "Live audit", title: "Every requirement, checked", image: orderImage.url, video: orderVideo.url, alt: "Actual Atlas audit with the checklist, verification steps, evidence and expert guidance" },
  { label: "Report & CAPA", title: "A verdict you can question", image: reportImage.url, video: reportVideo.url, alt: "Actual supplier audit report and Atlas explanation of the top three risks" },
];

function Recording({ selected, active, paused, muted, onSoundBlocked }: { selected: number; active: boolean; paused: boolean; muted: boolean; onSoundBlocked: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const window = windows[selected] ?? windows[0];
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = muted;
    if (active && !paused && !matchMedia("(prefers-reduced-motion: reduce)").matches) void video.play().catch(() => {
      if (!muted) onSoundBlocked();
    });
    else video.pause();
  }, [active, paused, selected, muted, onSoundBlocked]);
  useEffect(() => {
    const video = ref.current;
    if (!video || !active || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = focusTracks[selected] ?? WIDE;
    let x = .5, y = .5, z = 1, raf = 0;
    const tick = () => {
      const [, tx, ty, tz] = focusAt(track, video.currentTime);
      x += (tx - x) * .035; y += (ty - y) * .035; z += (tz - z) * .03;
      video.style.transformOrigin = `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`;
      video.style.transform = `scale(${z.toFixed(4)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); video.style.transform = ""; };
  }, [active, selected]);
  if (!window) return null;
  return <video ref={ref} key={window.video} src={active ? window.video : undefined} poster={window.image} muted={muted} loop playsInline preload="metadata" aria-label={window.alt} />;
}

/** Original Atlas recordings, displayed at product scale; the scroll selects each window. */
export function AtlasInterface({ active, progress }: { active: boolean; progress: number }) {
  const scrollStage = Math.max(0, Math.min(2, Math.floor(progress * 3)));
  const [choice, setChoice] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const onSoundBlocked = useCallback(() => setSoundMuted(true), []);
  const stage = choice ?? scrollStage;
  const muted = stage === 0 || soundMuted;
  useEffect(() => { setChoice(null); }, [scrollStage]);
  useEffect(() => { if (!active) setExpanded(false); }, [active]);
  useEffect(() => {
    if (!expanded) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setExpanded(false); };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [expanded]);
  const current = windows[stage];
  return <aside className={`atlas-demo ${active ? "is-active" : ""} ${expanded ? "is-expanded" : ""}`} aria-hidden={!active} inert={!active} role={expanded ? "dialog" : undefined} aria-modal={expanded ? true : undefined} aria-label="Atlas product demo">
    <header className="atlas-demo-header">
      <div className="atlas-demo-heading"><span className="atlas-demo-logo">ATLAS <i>AI</i></span><strong>{current?.title}</strong></div>
      <nav aria-label="Atlas windows">{windows.map((window, i) => <Button key={window.label} variant="ghost" className={i === stage ? "is-selected" : ""} aria-pressed={i === stage} onClick={() => setChoice(i)}><small>0{i + 1}</small>{window.label}</Button>)}</nav>
      <div className="atlas-demo-controls">
        {stage !== 0 && <Button variant="cinematicGhost" size="icon" title={muted ? "Enable original audio" : "Mute recording"} aria-label={muted ? "Enable original audio" : "Mute recording"} aria-pressed={!muted} onClick={() => setSoundMuted(value => !value)}>{muted ? <VolumeX /> : <Volume2 />}</Button>}
        <Button variant="cinematicGhost" size="icon" title={paused ? "Play recording" : "Pause recording"} aria-label={paused ? "Play recording" : "Pause recording"} onClick={() => setPaused(value => !value)}>{paused ? <Play /> : <Pause />}</Button>
        <Button variant="cinematicGhost" size="icon" title={expanded ? "Close expanded view" : "Expand Atlas"} aria-label={expanded ? "Close expanded view" : "Expand Atlas"} onClick={() => setExpanded(value => !value)}>{expanded ? <Minimize2 /> : <Maximize2 />}</Button>
        {expanded && <Button variant="cinematicGhost" size="icon" aria-label="Close Atlas" onClick={() => setExpanded(false)}><X /></Button>}
      </div>
    </header>
    <div className="atlas-demo-progress"><i style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }} /></div>
    <div className="atlas-demo-screen" data-atlas-stage={stage} key={stage}><Recording selected={stage} active={active} paused={paused} muted={muted} onSoundBlocked={onSoundBlocked} /></div>
  </aside>;
}
