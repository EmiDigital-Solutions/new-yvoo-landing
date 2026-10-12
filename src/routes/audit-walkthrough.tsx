import { createFileRoute, Link } from "@tanstack/react-router";
import { YvooLogo } from "@/components/yvoo/YvooLogo";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { WalkthroughWorld } from "@/components/yvoo/WalkthroughWorld";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/audit-walkthrough")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Audit walkthrough — Atlas AI scans every area | YVOO" },
    { name: "description", content: "A cinematic walk through a supplier audit: office, incoming goods, production, testing, dispatch and aerial inspection, checked by Atlas AI." },
    { property: "og:title", content: "Audit walkthrough — Atlas AI scans every area | YVOO" },
    { property: "og:description", content: "From office to dispatch dock: Atlas AI checks paper against floor at every stop." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WalkthroughPage,
});

type Chapter = { at: number; kicker: string; title: React.ReactNode; body: string; points?: Array<{ k: string; t: string; d?: string }>; cta?: boolean };

// `at` = scroll progress where the camera reaches each station plate.
const chapters: Chapter[] = [
  { at: 0, kicker: "Audit walkthrough · Atlas AI", title: <>One audit<br /><em>Every area of the plant</em></>, body: "Atlas AI walks the supplier from the office to the dispatch dock and checks paper against floor at every stop." },
  { at: 0.17, kicker: "01 · Office & documentation", title: <>On paper,<br /><em>everything looks complete</em></>, body: "Certificates, SAQ, released procedures and quality plans. Atlas reads every document and names what is still unproven.", points: [{ k: "→", t: "Certificates & SAQ" }, { k: "→", t: "Released procedures" }, { k: "→", t: "Open checkpoints derived from your spec" }] },
  { at: 0.34, kicker: "02 · Incoming goods & warehouse", title: <>The first reality check:<br /><em>does material match the paper?</em></>, body: "Batches, labels and material certificates are matched against the documentation where traceability begins.", points: [{ k: "→", t: "Material certificates" }, { k: "→", t: "Batch identification" }, { k: "→", t: "Storage conditions" }] },
  { at: 0.5, kicker: "03 · Production", title: <>Procedure released<br /><em>Applied at the machine?</em></>, body: "Where value is created, Atlas checks whether the documented process is really today's practice on the floor.", points: [{ k: "→", t: "Procedure applied at the machine" }, { k: "→", t: "Operator qualified for the special process" }, { k: "→", t: "Equipment and maintenance state" }] },
  { at: 0.66, kicker: "04 · Testing & inspection", title: <>Evidence instead<br /><em>of claims</em></>, body: "Inspection logs and measured values are read for completeness, plausibility and contradictions.", points: [{ k: "→", t: "Measured values recorded" }, { k: "→", t: "Inspection logs complete" }, { k: "→", t: "Gauges and calibration" }] },
  { at: 0.8, kicker: "05 · Dispatch", title: <>Traceability until<br /><em>the part leaves the plant</em></>, body: "From mill certificate to shipment: Atlas follows the chain to the loading dock, where breaks usually stay hidden.", points: [{ k: "→", t: "Final inspection" }, { k: "→", t: "Packaging & labelling" }, { k: "→", t: "Chain from certificate to shipment" }] },
  { at: 0.92, kicker: "06 · Drone inspections · concept, on the roadmap", title: <>What nobody sees on foot:<br /><em>inspection from above</em></>, body: "Atlas turns drone flights over tanks, roofs and outdoor infrastructure into findings, CAPA and trend alerts." },
  { at: 1, kicker: "Result · Verified Supplier Record", title: <>Every area checked<br /><em>One record to decide</em></>, body: "Report, CAPA and evidence, reusable for the next decision.", cta: true },
];

function WalkthroughPage() {
  const progressRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const markReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const update = () => {
      frameRef.current = null;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const next = total > 0 ? Math.min(window.scrollY / total, 1) : 0;
      progressRef.current = next;
      setProgress(next);
    };
    const onScroll = () => { if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  let activeIndex = 0;
  chapters.forEach((c, i) => { if (progress >= c.at - 0.06) activeIndex = i; });

  return (
    <main className="world-shell walk-shell">
      <div className={`world-loader ${ready ? "is-ready" : ""}`}><strong>YVOO</strong><span>Entering the plant</span><i /></div>
      <div className="world-canvas" aria-hidden="true"><WalkthroughWorld progress={progressRef} onReady={markReady} /></div>
      <div className="world-grade" aria-hidden="true" />
      <div className="world-progress"><i style={{ transform: `scaleY(${progress})` }} /></div>
      <header className="world-header">
        <Link className="world-brand" to="/" aria-label="YVOO home"><YvooLogo /></Link>
        <span className="world-status"><i /> Audit walkthrough · Atlas AI scanning</span>
        <Button variant="cinematicGhost" asChild><Link to="/">Home</Link></Button>
      </header>
      <div className="world-hud">
        {chapters.map((chapter, index) => (
          <article key={index} className={`world-chapter align-${index % 2 ? "right" : "left"} ${activeIndex === index ? "is-active" : ""}`}>
            <p className="world-kicker"><span>{String(index).padStart(2, "0")} / {chapters.length - 1}</span>{chapter.kicker}</p>
            <h1>{chapter.title}</h1>
            <p className="world-copy">{chapter.body}</p>
            {index === 0 && <Button variant="cinematicGhost" className="world-enter" onClick={() => window.scrollTo({ top: (document.documentElement.scrollHeight - window.innerHeight) * 0.17, behavior: "smooth" })}>Start the walkthrough <ArrowDown /></Button>}
            {chapter.cta && <Button variant="cinematic" size="lg" asChild><a href="https://calendly.com/yvoo/demo-yvoo" target="_blank" rel="noreferrer">Book a demo <ArrowUpRight /></a></Button>}
          </article>
        ))}
      </div>
      <div className="world-scroll-space" />
    </main>
  );
}
