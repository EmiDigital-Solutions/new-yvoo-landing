import type { CSSProperties } from "react";
import { Check, ArrowDownRight } from "lucide-react";

const stations = ["Documentation", "Incoming goods", "Production", "Inspection", "Dispatch"];
const stationEvidence = ["Certificates · self-assessments", "Batch labels · material certificates", "Processes · operator qualifications", "Calibration · measurement records", "Release · shipment records"];

/** Editorial evidence layers follow the homepage score without changing its camera. */
export function HomeEvidenceScore({ chapter, progress }: { chapter: number; progress: number }) {
  if (chapter >= 2 && chapter <= 6) {
    const station = chapter - 2;
    return <aside className="home-evidence home-trace" aria-label="Plant verification evidence chain">
      <div className="home-evidence-heading"><span>Plant verification</span><span>{String(station + 1).padStart(2, "0")} / 05</span></div>
      <ol className="home-trace-stations">{stations.map((name, i) => <li key={name} className={i === station ? "is-current" : i < station ? "is-past" : ""}><span className="home-trace-mark">{i < station ? <Check aria-hidden="true" /> : String(i + 1).padStart(2, "0")}</span><span>{name}</span></li>)}</ol>
      <div className="home-trace-detail" key={station}><span>Evidence in focus</span><strong>{stationEvidence[station]}</strong></div>
    </aside>;
  }
  if (chapter !== 10) return null;
  const reveal = Math.max(0, Math.min(1, progress * 2));
  return <aside className="home-evidence home-verdict" aria-label="Anonymised verification case" style={{ "--evidence-reveal": reveal } as CSSProperties}>
    <div className="home-evidence-heading"><span>One verification. Every proof.</span><span>200</span></div>
    <div className="home-proof-field" aria-hidden="true">{Array.from({ length: 200 }, (_, i) => <i key={i} className={i < 60 ? "is-accepted" : "is-rejected"} />)}</div>
    <div className="home-proof-legend"><span><i /> <strong>60</strong> accepted</span><span><i /> <strong>140</strong> rejected with reasons</span></div>
    <div className="home-exposure">
      <div className="home-evidence-heading"><span>Financial exposure</span><ArrowDownRight aria-hidden="true" /></div>
      <div className="home-exposure-row"><span>Before actions</span><strong>€682k</strong><div><i /></div></div>
      <div className="home-exposure-row is-after"><span>After actions</span><strong>€97k</strong><div><i /></div></div>
      <div className="home-exposure-impact"><strong>−86<span>%</span></strong><p>exposure before<br />series launch</p></div>
    </div>
    <p className="home-case-caveat">Anonymised real case. Not a typical result.</p>
  </aside>;
}