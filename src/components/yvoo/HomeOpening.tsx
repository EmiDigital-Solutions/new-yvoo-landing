import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const scenes = [
  { title: ["Find.", "Verify.", "Qualify."], context: "Suppliers worldwide", text: "Supplier intelligence. Independent evidence. One clear decision." },
  { title: ["Beyond", "the claim."], context: "Verify what matters", text: "Atlas reads the proof. A local expert verifies what remains unknown." },
  { title: ["Evidence.", "Then a decision."], context: "Qualify with confidence", text: "Go beyond the paperwork. Follow the evidence onto the floor." },
];

/** The opening is a scroll-directed editorial sequence over the existing living world. */
export function HomeOpening({ progress, onEnter, onContact }: { progress: number; onEnter: () => void; onContact: () => void }) {
  const active = Math.min(2, Math.floor(progress * 3));
  return <div className="home-opening">
    <h1 className="sr-only">Find. Verify. Qualify. Suppliers worldwide</h1>
    {scenes.map((scene, i) => <div key={scene.context} className={`ho-scene ${active === i ? "is-current" : ""}`} aria-hidden={active !== i}>
      <h2>{scene.title.map(line => <span key={line}>{line}</span>)}</h2>
      <div className="ho-context"><strong>{scene.context}</strong><p>{scene.text}</p></div>
    </div>)}
    <div className="ho-actions"><Button variant="cinematic" onClick={onContact}>Start a pilot <ArrowUpRight /></Button><Button variant="ghost" onClick={onEnter} aria-label="Continue to the YVOO DNA">Explore our DNA <ArrowDown /></Button></div>
    <div className="ho-score" aria-label={`Opening scene ${active + 1} of 3`}>{scenes.map((scene, i) => <div key={scene.context} className={i === active ? "is-current" : ""}><span>{["Find", "Verify", "Qualify"][i]}</span><i><b style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress * 3 - i))})` }} /></i></div>)}</div>
  </div>;
}