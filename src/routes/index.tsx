import { homeChapterIndex, HOME_CHAPTER_STARTS } from "@/components/yvoo/home-scene-timeline";
import { createFileRoute, Link } from "@tanstack/react-router";
import { YvooLogo } from "@/components/yvoo/YvooLogo";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { HomeWorld } from "@/components/yvoo/HomeWorld";
import { Button } from "@/components/ui/button";
import { ContactDrawer } from "@/components/yvoo/ContactDrawer";
import { AtlasInterface } from "@/components/yvoo/AtlasInterface";
import { VerificationOrbit } from "@/components/yvoo/VerificationOrbit";
import { HomeNarrative } from "@/components/yvoo/HomeNarrative";
import { HomeProofWorld } from "@/components/yvoo/HomeProofWorld";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ meta: [
    { title: "YVOO — Find, verify and qualify suppliers worldwide" },
    { name: "description", content: "Supplier intelligence and evidence-led verification. From first search to one reusable verified supplier record." },
    { property: "og:title", content: "YVOO — Supplier intelligence and verification" },
    { property: "og:description", content: "Find, verify and qualify a new supplier in weeks instead of months." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap" }] }),
  component: Index,
});

type Point = { k: string; t: string; d?: string };
type ChapterInput = {
  at: number; part: string; kicker: string; title: React.ReactNode; body: string;
  align?: "left" | "right"; facts?: Array<{ value: string; label: string }>; points?: Point[]; note?: string;
};
type Chapter = ChapterInput & { label: string };

const chapterInput: ChapterInput[] = [
  { at: 0, part: "01", kicker: "00 · Supplier verification", title: <>Crystal clear<br /><em>supplier verdict</em></>, body: "Find, verify and qualify a new supplier in weeks instead of months, with evidence your quality team can sign off." },
  { at: 0.043, part: "01", kicker: "01 · Our DNA", title: <>First, the DNA<br /><em>behind every verdict</em></>, body: "Deep domain know-how built into technology. Atlas AI reads every proof, three verification levels set the depth, and a certified local expert checks only what remains unproven.", points: [{ k: "L1", t: "Evidence check", d: "Atlas and a QA expert" }, { k: "L2", t: "Guided self-assessment", d: "Supplier, led by Atlas" }, { k: "L3", t: "Independent verification", d: "Certified inspector or lead auditor" }], note: "Digital first, on site only where the evidence is not enough." },
  { at: 0.184, part: "02", kicker: "02 · Office and documentation", title: <>On paper,<br /><em>every supplier looks complete</em></>, body: "Today, qualifying one new supplier takes 15–27 weeks and 25–40 hours of your team per audit. Certificates and self-assessments still rarely show what happens on the shop floor, so Atlas lists exactly what remains unproven." },
  { at: 0.237, part: "02", kicker: "03 · Incoming goods", title: <>Traceability starts<br /><em>at the receiving dock</em></>, body: "Batch labels, storage conditions and material certificates are matched against the paperwork, so the material chain is proven from the first delivery." },
  { at: 0.29, part: "02", kicker: "04 · Production", title: <>Released procedure<br /><em>or real practice at the machine?</em></>, body: "Atlas checks whether documented processes are applied on the floor, whether operators are qualified for special processes, and whether equipment is maintained." },
  { at: 0.343, part: "02", kicker: "05 · Testing and inspection", title: <>Measured values<br /><em>instead of claims</em></>, body: "Inspection logs, gauge calibration and recorded measurements are checked for completeness, plausibility and contradictions." },
  { at: 0.38, part: "02", kicker: "06 · Dispatch", title: <>Traceability until<br /><em>the part leaves the plant</em></>, body: "From mill certificate to shipment, Atlas follows the full chain to the loading dock, where breaks usually stay hidden." },
  { at: 0.43, part: "03", kicker: "07 · The engine", title: <>How it works</>, body: "L1 digital audit, L2 guided self-audit, L3 independent on-site verification, then full CAPA management. Atlas AI runs every step, so your team only decides.", facts: [{ value: "≈5–7 wk", label: "search to signed report, instead of 15–27 wk" }], note: "Reference targets the pilot is designed to measure; scope and location affect duration." },
  { at: 0.53, part: "03", kicker: "08 · The network", title: <>The right local expert<br /><em>in 80+ countries</em></>, body: "A pool of about 400,000 auditors, inspectors and quality experts. One Atlas method and scoring logic, with a certified lead auditor on site in as little as three business days.", facts: [{ value: "400k+", label: "addressable experts" }, { value: "3 days", label: "to an auditor on site, at the earliest" }], note: "YVOO service standard, subject to scope and auditor availability." },
  { at: 0.696, part: "03", kicker: "09 · The proof", title: <>Atlas AI rejected<br /><em>140 of 200 supplier proofs</em></>, body: "In a real case, the supplier submitted 200 proofs. Atlas checked each one against the requirement and rejected 140, each with a clear reason.", facts: [{ value: "60", label: "accepted" }, { value: "140", label: "rejected, each with a reason" }], points: [{ k: "94%", t: "Procedures released, evidence fields empty", d: "12 deviations in 5 areas: instruction sheets, logs and measurement fields left blank" }, { k: "91%", t: "Traceability breaks at release", d: "the chain from mill certificate to shipment cannot be rebuilt for any item" }], note: "Confidence values shown. Anonymised real case from a YVOO supplier verification; not a typical result." },
  { at: 0.8, part: "03", kicker: "10 · The result", title: <>One verdict: €682k exposure found,<br /><em>€97k after actions</em></>, body: "Risk was priced before series launch, not discovered at PPAP or in the field. The supplier is released only once the listed corrective actions are closed.", facts: [{ value: "78 / 100", label: "score" }, { value: "1 + 28", label: "major + minor deviations" }, { value: "16", label: "areas checked" }, { value: "−86%", label: "exposure before series" }], note: "Anonymised real case, not a typical result." },
  { at: 0.998, part: "03", kicker: "11 · Your pilot", title: <>Start with one supplier<br /><em>or one purchase order</em></>, body: "A paid pilot on your own specification. Scope and price are agreed upfront, and we measure time to a signed report, auditor mobilisation and record reuse.", points: [{ k: "S", t: "Verification Sprint · 1–3 suppliers before nomination", d: "You send supplier, part family, requirement (minutes) · Atlas checks every proof, rated with a reason (days) · You get verdict, open gaps, next step (≈1 h of your time) · Paid from day one, per supplier" }, { k: "V", t: "Vendor inspection · one PO, every inspection point", d: "You send PO, ITP, drawings, schedule (minutes) · Atlas plans hold and witness points, evidence (before the visit) · You get findings with schedule and cost impact (per inspection) · Quoted by scope, site and inspector" }] },
];

const chapters: Chapter[] = chapterInput.map((chapter, index) => ({
  ...chapter,
  at: index === 0 ? 0 : (HOME_CHAPTER_STARTS[index] ?? chapter.at) + .015,
  label: `${String(index).padStart(2, "0")} / ${chapterInput.length - 1}`,
}));

const partTitles: Record<string, string> = { "01": "The opening", "02": "Audit walkthrough", "03": "Proof and pilot" };
const parts = Object.entries(partTitles).map(([label, title]) => ({ label, title, at: chapters.find((chapter) => chapter.part === label)?.at ?? 0 }));

function YvooMark() { return <a className="world-brand" href="#start" aria-label="YVOO home"><YvooLogo /></a>; }

function Index() {
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);
  const [contactOpen, setContactOpen] = useState(false);
  const [pct, setPct] = useState(0);
  const startRef = useRef(performance.now());
  const readyAtRef = useRef(0);
  useEffect(() => { if (ready) readyAtRef.current = performance.now(); }, [ready]);
  useEffect(() => {
    const id = window.setInterval(() => {
      setPct(() => {
        const total = performance.now() - startRef.current;
        const base = Math.min(92, (total / 2400) * 92);
        if (readyAtRef.current || total > 8000) {
          const since = readyAtRef.current ? performance.now() - readyAtRef.current : total - 8000;
          return base >= 92 ? Math.min(100, 92 + (since / 500) * 8) : base;
        }
        return base;
      });
    }, 40);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    // Cinematic glide: camera eases toward the scroll target instead of following it 1:1.
    let target = 0; let shown = -1; let previousTime = performance.now();
    const read = () => { const total = document.documentElement.scrollHeight - window.innerHeight; target = total > 0 ? Math.min(window.scrollY / total, 1) : 0; };
    const tick = (time: number) => {
      const delta = Math.min(1, (time - previousTime) / 1000);
      previousTime = time;
      const cur = progressRef.current;
      const next = Math.abs(target - cur) < 0.00005 ? target : cur + (target - cur) * (1 - Math.exp(-3.7125 * delta));
      progressRef.current = next;
      if (Math.abs(next - shown) > 0.0008) { shown = next; setProgress(next); }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    read(); progressRef.current = target;
    window.addEventListener("scroll", read, { passive: true }); window.addEventListener("resize", read);
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("scroll", read); window.removeEventListener("resize", read);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const jumpTo = (at: number) => {
    window.scrollTo({ top: (document.documentElement.scrollHeight - window.innerHeight) * at, behavior: "smooth" });
    setMenuOpen(false);
  };
  const activeIndex = homeChapterIndex(progress);
  const activePart = chapters[activeIndex]?.part ?? "00";
  const currentChapter = chapters[activeIndex];
  const chapterDescription = activeIndex === 0 ? "Supplier verification" : currentChapter?.kicker.split(" · ")[1] ?? "Evidence";
  const chapterStart = HOME_CHAPTER_STARTS[activeIndex] ?? 0;
  const chapterEnd = HOME_CHAPTER_STARTS[activeIndex + 1] ?? 1;
  const chapterProgress = Math.max(0, Math.min(1, (progress - chapterStart) / Math.max(0.001, chapterEnd - chapterStart)));

  return (
    <main id="start" data-home-chapter={activeIndex} className={`world-shell home-shell home-cinema ${activeIndex === 0 ? "is-opening-scene" : ""} ${activeIndex === 1 ? "is-dna-scene" : ""} ${activeIndex === 10 ? "has-verdict" : ""} ${/^09 /.test(chapters[activeIndex]?.kicker ?? "") ? "has-atlas-demo" : ""} ${/^07 /.test(chapters[activeIndex]?.kicker ?? "") ? "has-orbit" : ""}`}>
      <div className={`world-loader ${ready && pct >= 100 ? "is-ready" : ""}`}><h2 className="loader-headline">Supplier Verification Engine</h2><strong className="loader-pct">{String(Math.floor(pct)).padStart(2, "0")}%</strong><span>Atlas · building the evidence chain</span></div>
      <div className="world-canvas" aria-hidden="true"><HomeWorld progress={progressRef} onReady={markReady} /></div>
      <div className="world-grade" aria-hidden="true" />
      <div className="world-progress"><i style={{ transform: `scaleY(${progress})` }} /></div>
      <header className="world-header"><YvooMark /><span className="world-status">Independent evidence.<br />Intelligent decisions.</span><Button variant="ghost" size="sm" className="world-header-cta" onClick={() => setContactOpen(true)}>Let's talk <ArrowUpRight /></Button><Button variant="cinematicGhost" size="icon" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X /> : <Menu />}</Button></header>
      <nav className={`world-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <p>YVOO / THE EVIDENCE CHAIN</p>
        {parts.map((part) => <Button key={part.label} variant="ghost" onClick={() => jumpTo(part.at)} className={activePart === part.label ? "is-current" : ""}><small>{part.label}</small><span>{part.title}</span><ArrowUpRight /></Button>)}
        <Button variant="ghost" asChild><Link to="/audit-walkthrough"><small>Film</small><span>Audit walkthrough</span><ArrowUpRight /></Link></Button>
        <Button variant="ghost" asChild><Link to="/auditors"><small>Join</small><span>For auditors</span><ArrowUpRight /></Link></Button>
      </nav>
      <HomeNarrative chapter={activeIndex} progress={chapterProgress} onEnter={() => jumpTo(chapters[1]?.at ?? .05)} onContact={() => setContactOpen(true)} />
      {activeIndex === 10 && <HomeProofWorld progress={chapterProgress} />}
      {(() => { const i = chapters.findIndex((c) => c.kicker.startsWith("07 ")); const a = HOME_CHAPTER_STARTS[i] ?? 0; const z = HOME_CHAPTER_STARTS[i+1] ?? 1; const p = Math.max(0, Math.min(0.999, (progress - a) / (z - a))); return <VerificationOrbit active={activeIndex === i} step={Math.floor(p * 4)} progress={p} onPick={(s) => jumpTo(a + ((s + 0.5) / 4) * (z - a))} />; })()}
      <AtlasInterface active={chapters[activeIndex]?.kicker.startsWith("09 ") ?? false} progress={(() => { const i = chapters.findIndex((c) => c.kicker.startsWith("09 ")); const a = HOME_CHAPTER_STARTS[i] ?? 0; const z = HOME_CHAPTER_STARTS[i+1] ?? 1; return Math.max(0, Math.min(0.999, (progress - a) / (z - a))); })()} />
      <nav className="chapter-dots" aria-label="Chapters">{chapters.map((c, i) => <Button key={c.label} variant="ghost" size="icon" className={`chapter-dot ${i === activeIndex ? "is-active" : ""}`} onClick={() => jumpTo(c.at)} aria-label={`Chapter ${c.label}`} aria-current={i === activeIndex ? "step" : undefined}>{i === activeIndex && <><span className="chapter-dot-label" key={activeIndex}>{chapterDescription}</span><svg className="chapter-dot-ring" viewBox="0 0 40 40" aria-hidden="true"><circle className="chapter-dot-track" cx="20" cy="20" r="18" /><circle cx="20" cy="20" r="18" pathLength="100" strokeDasharray={`${Math.max(8, chapterProgress * 100)} 100`} /></svg></>}<i aria-hidden="true" /></Button>)}</nav>
      <div className="world-film" aria-hidden="true" />
      {(() => { const c = chapters[activeIndex]; const has = !!(c && (c.facts || c.points || c.note)); return <Button variant="cinematicGhost" className={`world-orb ${progress > .99 ? "is-hidden" : ""}`} onClick={() => has ? setEvidenceOpen(true) : setContactOpen(true)} aria-label={has ? "Show evidence" : "Pilot anfragen"}><svg className="world-orb-arc" viewBox="0 0 180 180" aria-hidden="true"><circle cx="90" cy="90" r="86" /></svg><span>{has ? <>See the<br />evidence</> : <>Start a<br />pilot</>}</span></Button>; })()}
      {(() => { const c = chapters[activeIndex]; return <div className={`contact-layer ${evidenceOpen ? "is-open" : ""}`} aria-hidden={!evidenceOpen}>
        <Button variant="ghost" className="contact-backdrop" onClick={() => setEvidenceOpen(false)} aria-label="Close" tabIndex={-1} />
        <aside className="contact-drawer evidence-drawer" role="dialog" aria-label="Evidence">
          <div className="contact-head"><p>{c?.label} / EVIDENCE</p><Button variant="cinematicGhost" size="icon" onClick={() => setEvidenceOpen(false)} aria-label="Close"><X /></Button></div>
          {c && <><h2>{c.title}</h2><p className="contact-sub">{c.body}</p>
          {c.facts && <div className="world-facts">{c.facts.map((f) => <div key={f.value + f.label}><strong>{f.value}</strong><span>{f.label}</span></div>)}</div>}
          {c.note && <p className="world-note">{c.note}</p>}</>}
          <Button variant="cinematic" size="lg" onClick={() => { setEvidenceOpen(false); setContactOpen(true); }}>Start a pilot <ArrowUpRight /></Button>
        </aside></div>; })()}
      <ContactDrawer open={contactOpen} onClose={() => setContactOpen(false)} />
      <div className="world-scroll-space" />
    </main>
  );
}