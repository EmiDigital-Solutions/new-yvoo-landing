import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AuditorCinematicScene, AuditorChapterNavigation, useAuditorCinema } from "@/components/yvoo/AuditorCinematicScene";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { YvooLogo } from "@/components/yvoo/YvooLogo";
import { AUDITOR_INTRO_URL, auditorChapters, auditorOpportunities, auditorFaq } from "@/components/yvoo/auditor-story";
import { AuditorFilmBackdrop } from "@/components/yvoo/AuditorFilmBackdrop";
import "@/components/yvoo/auditor-page.css";

export const Route = createFileRoute("/auditors")({
  ssr: false,
  head: () => ({ meta: [
    { title: "YVOO Auditors — Your expertise. Your terms." },
    { name: "description", content: "Independent enterprise audit assignments, transparent fees, local work and Atlas AI support. Become a YVOO auditor partner." },
    { property: "og:title", content: "YVOO Auditors — Your expertise. Your terms." },
    { property: "og:description", content: "Explore independent audit work, transparent assignment fees and same-business-day payment with YVOO." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&display=swap" }] }), component: AuditorsPage,
});

function IntroLink({ label = "Apply for Partnership" }: { label?: string }) {
  return <Button variant="cinematic" asChild><a href={AUDITOR_INTRO_URL} target="_blank" rel="noreferrer">{label}<ArrowUpRight /></a></Button>;
}
function Orb({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="ap-textlink" onClick={onClick}><span>{children}</span></button>;
}
function Loader() {
  const [n, setN] = useState(0);
  useEffect(() => { const t0 = performance.now(); let f = 0; const tick = (t: number) => { const v = Math.min(100, Math.round((t - t0) / 14)); setN(v); if (v < 100) f = requestAnimationFrame(tick); }; f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f); }, []);
  return <div className={`ap-loader ${n >= 100 ? "is-done" : ""}`} aria-hidden="true"><div className="ap-loader-mark">YVOO</div><strong>{n}%</strong><small>Loading your journey</small></div>;
}
const expertise: [string, string][] = [
  ["Equipment recognition", "Atlas AI identifies machines and measuring equipment on site, so you document by pointing, not typing."],
  ["Live documentation", "Findings, photos and evidence are captured as you audit — structured to the standard in real time."],
  ["Automatic reports", "Your report is drafted from the audit itself. You review, sign off and submit."],
];
const lifecycle: [string, string][] = [
  ["Assigned", "You see client, standard, location and fee upfront — and accept only what fits your schedule."],
  ["On-site", "You audit at the client's facility. Atlas AI captures evidence and findings alongside you."],
  ["Report", "Submit your report directly from the platform. No formatting, no extra paperwork."],
  ["Validated", "YVOO validates the report against the standard and the client's requirements."],
  ["Paid", "Payment is auto-released the same business day by direct bank transfer. No invoicing."],
];
function StepStack({ items }: { items: [string, string][] }) {
  return <div className="ap-step-stack">{items.map(([title, text], i) => <div key={title} className={`ap-step ${i === 0 ? "is-current" : ""}`} data-step-item={i}><h2>{title}</h2><p>{text}</p></div>)}</div>;
}
function StepRail({ label, items }: { label: string; items: string[] }) {
  const n = items.length;
  return <div className="ap-rail" aria-label={label} style={{ ["--n" as string]: n }}>
    <div className="ap-rail-head"><span className="ap-live"><i />{label}</span><span className="ap-count">{items.map((_, i) => <b key={i} data-step-item={i} className={i === 0 ? "is-current" : ""}>{String(i + 1).padStart(2, "0")}</b>)}<em>/ {String(n).padStart(2, "0")}</em></span></div>
    <div className="ap-track"><div className="ap-track-ticks" /><div className="ap-track-fill"><i /></div>
      {items.map((item, i) => <div key={item} className={`ap-node ${i === 0 ? "is-current" : ""}`} data-step-item={i} style={{ left: `${(i / (n - 1)) * 100}%` }}><i /><span>{item}</span></div>)}
    </div>
  </div>;
}
const detailNames = { work: "Your work", payment: "Fees & payment", partnership: "Partnership requirements", questions: "Questions auditors ask" };
type Detail = keyof typeof detailNames;
function AuditorsPage() {
  const { root, active, jump } = useAuditorCinema();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [assignment, setAssignment] = useState(2);
  const opportunity = auditorOpportunities[assignment];
  return <main className="auditor-page ap-cinematic" ref={root}>
    <Loader />
    <AuditorFilmBackdrop />
    <AuditorChapterNavigation active={active} jump={jump} />
    <header className="ap-header"><Link to="/" aria-label="YVOO home"><YvooLogo /></Link><nav aria-label="Auditor navigation"><Button variant="ghost" onClick={() => setDetail("payment")}>Fees & payment</Button><Button variant="ghost" onClick={() => setDetail("questions")}>Questions</Button></nav><IntroLink /></header>
    <AuditorCinematicScene className="ap-hero"><h1>Audit on<br />your terms.</h1><p>Independent audit assignments for enterprise clients in automotive, aerospace and medical devices — close to home, paid the day you submit.</p><div className="ap-glass ap-hero-points"><div><strong>Same day</strong><span>Payment after report</span></div><div><strong>No exclusivity</strong><span>Choose your workload</span></div><div><strong>Atlas AI</strong><span>Documentation handled</span></div></div><IntroLink /><div className="ap-industries">Automotive · Aerospace · Medical devices</div></AuditorCinematicScene>
    <AuditorCinematicScene id="work"><h2>Closer to home.<br /><em>More freedom.</em></h2><p>Choose your assignments. Set your workload. No exclusivity.</p><div className="ap-chips"><span>Assignments near you</span><span>Enterprise clients</span><span>Your calendar</span></div><Orb onClick={() => setDetail("work")}>Working<br />conditions</Orb></AuditorCinematicScene>
    <AuditorCinematicScene steps={expertise.length}><div className="ap-kicker">Your expertise. Not paperwork.</div><StepStack items={expertise} /><StepRail label="Atlas AI" items={expertise.map(e => e[0])} /></AuditorCinematicScene>
    <AuditorCinematicScene id="payment" steps={lifecycle.length}><div className="ap-kicker">Audit lifecycle · Paid same day</div><StepStack items={lifecycle} /><StepRail label="Audit lifecycle" items={lifecycle.map(e => e[0])} /><Orb onClick={() => setDetail("payment")}>Payment terms</Orb></AuditorCinematicScene>
    <AuditorCinematicScene id="opportunities" steps={auditorOpportunities.length}><div className="ap-kicker">Real work. Real fees.</div><div className="ap-step-stack">{auditorOpportunities.map((item, i) => <div key={item.standard} className={`ap-step ${i === 0 ? "is-current" : ""}`} data-step-item={i}><h2>{item.standard}</h2><p>{item.industry} · {item.location} · {item.days} days</p><div className="ap-case-fee">{item.fee}</div></div>)}</div><StepRail label="Real cases" items={auditorOpportunities.map(o => o.standard)} /><small className="ap-note">Illustrative assignments. Fees vary by scope and region.</small></AuditorCinematicScene>
    <AuditorCinematicScene className="ap-final" id="partnership"><h2>Your next chapter.<br /><em>On your terms.</em></h2><nav className="ap-final-list" aria-label="Next steps"><a href={AUDITOR_INTRO_URL} target="_blank" rel="noreferrer">Schedule intro call<i /></a><button type="button" onClick={() => setDetail("partnership")}>Check if you qualify<i /></button><button type="button" onClick={() => setDetail("payment")}>Fees & payment<i /></button><button type="button" onClick={() => setDetail("questions")}>Questions auditors ask<i /></button><Link to="/">Visit yvoo.com<i /></Link></nav></AuditorCinematicScene>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className="ap-details"><DialogTitle>{detail ? detailNames[detail] : "Auditor partnership"}</DialogTitle><DialogDescription>YVOO auditor partnership</DialogDescription>
      {detail === "work" && <><p>{auditorFaq[1]?.[1]}</p><h3>Enterprise clients</h3><p>{auditorFaq[2]?.[1]}</p><h3>Assignments matched to you</h3><p>{auditorFaq[3]?.[1]}</p></>}
      {detail === "payment" && <><p>{auditorFaq[0]?.[1]}</p><table><thead><tr><th>Standard</th><th>Location / days</th><th>Fee</th></tr></thead><tbody>{auditorOpportunities.map(item => <tr key={item.standard}><td>{item.standard}</td><td>{item.location} / {item.days}</td><td>{item.fee}</td></tr>)}</tbody></table><p>Examples based on recent assignments. Fees vary by standard, complexity, and region.</p></>}
      {detail === "partnership" && <><ul>{auditorChapters[7]?.details.map(([title, text]) => <li key={title}><Check /><span>{text}</span></li>)}</ul><h3>Application & verification</h3><p>{auditorFaq[5]?.[1]}</p><IntroLink /></>}
      {detail === "questions" && <div className="ap-faq">{auditorFaq.map(([question, answer]) => <details key={question}><summary>{question}<Plus /></summary><p>{answer}</p></details>)}</div>}
    </DialogContent></Dialog>
  </main>;
}
