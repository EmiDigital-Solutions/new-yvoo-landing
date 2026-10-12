import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeOpening } from "./HomeOpening";

const stories = [
  ["Find. Verify. Qualify.", "Suppliers worldwide", "Supplier intelligence. Independent evidence. One clear decision."],
  ["Intelligence is nothing.", "Without evidence.", "Atlas reads the proof. A local expert verifies what remains unknown."],
  ["A certificate isn't", "the whole story.", "Go beyond the paperwork. Follow the evidence onto the floor."],
  ["Every delivery.", "A traceable origin.", "From batch labels to material certificates. Nothing disconnected."],
  ["What is written.", "What actually happens.", "Processes, people and equipment. Verified where the work happens."],
  ["Don't trust a claim.", "Measure it.", "Calibration. Inspection logs. Recorded results. Evidence that holds up."],
  ["From the first batch.", "To the last shipment.", "One unbroken chain of evidence across the plant."],
  ["How it works", "", ""],
  ["Global reach.", "Local intelligence.", "The right local expert in 80+ countries. One verification method."],
  ["Meet Atlas.", "See the work.", ""],
  ["200 proofs.", "One different picture.", "140 rejected. Every rejection explained."],
  ["Your supplier.", "Your next decision.", "Start with one supplier or one purchase order. A paid pilot. A defined scope."],
];

export function HomeNarrative({ chapter, progress, onEnter, onContact }: { chapter: number; progress: number; onEnter: () => void; onContact: () => void }) {
  const story = stories[chapter];
  if (!story) return null;
  const walkthrough = chapter >= 2 && chapter <= 6;
  return <div className={`home-narrative ${chapter === 0 ? "hn-opening" : ""} ${walkthrough ? "hn-walk" : ""} ${chapter === 7 || chapter === 9 ? "hn-product" : ""} ${chapter === 10 ? "hn-proof" : ""} ${chapter === 11 ? "hn-pilot" : ""}`} key={chapter}>
    {chapter === 0 ? <HomeOpening progress={progress} onEnter={onEnter} onContact={onContact} /> : <>
    <div className="hn-title"><h2><span>{story[0]}</span><span>{story[1]}</span></h2></div>
    {chapter !== 7 && chapter !== 9 && <div className="hn-caption"><p>{story[2]}</p>{chapter === 11 && <Button variant="cinematic" onClick={onContact}>Start a pilot <ArrowUpRight /></Button>}</div>}
    </>}
    {chapter === 1 && <div className="hn-dna-key"><span>Atlas intelligence</span><span>Verification depth</span><span>Independent expertise</span></div>}
    {chapter === 8 && <div className="hn-network-fact"><strong>80<span>+</span></strong><p>countries.<br />One standard.</p></div>}
    {chapter === 10 && <div className="hn-proof-outcome"><div><span>Before actions</span><strong>€682k</strong></div><ArrowUpRight /><div><span>After actions</span><strong>€97k</strong></div><p>Anonymised real case. Not a typical result.</p></div>}
    {chapter === 11 && <div className="hn-pilot-choices"><Button variant="ghost" onClick={onContact}><span>01</span>Verification sprint<ArrowUpRight /></Button><Button variant="ghost" onClick={onContact}><span>02</span>Vendor inspection<ArrowUpRight /></Button></div>}
  </div>;
}