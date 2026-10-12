import { useState } from "react";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().trim().min(1, "Bitte Namen angeben").max(100),
  email: z.string().trim().email("Bitte gültige Business-E-Mail").max(255),
  company: z.string().trim().min(1, "Bitte Firma angeben").max(120),
  role: z.string().max(60),
  goal: z.string().max(60),
  message: z.string().trim().max(1000),
});

const roles = ["Einkauf / CPO", "Qualität / SQE", "Geschäftsführung / CEO", "Finanzen / CFO"];
const goals = ["Lieferanten-Audit", "Pilot-Projekt", "API / ERP-Anbindung"];

export function ContactDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const parsed = schema.safeParse(data);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen"); return; }
    setError("");
    const v = parsed.data;
    const body = `Name: ${v.name}\nE-Mail: ${v.email}\nFirma: ${v.company}\nRolle: ${v.role}\nZiel: ${v.goal}\n\n${v.message}`;
    window.location.href = `mailto:ivo.brandic@connectimus.com?subject=${encodeURIComponent(`YVOO Pilot – ${v.company}`)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <div className={`contact-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="contact-backdrop" onClick={onClose} aria-label="Schließen" tabIndex={-1} />
      <aside className="contact-drawer" role="dialog" aria-label="Pilot anfragen">
        <div className="contact-head"><p>YVOO / PILOT</p><Button variant="cinematicGhost" size="icon" onClick={onClose} aria-label="Schließen"><X /></Button></div>
        <h2>Start with one supplier</h2>
        <p className="contact-sub">Ein Lieferant oder eine Bestellung genügt. Wir melden uns innerhalb eines Werktags.</p>
        <form onSubmit={submit} noValidate>
          <label>Name<input name="name" maxLength={100} /></label>
          <label>Business-E-Mail<input name="email" type="email" maxLength={255} /></label>
          <label>Firma<input name="company" maxLength={120} /></label>
          <label>Rolle<select name="role">{roles.map((r) => <option key={r}>{r}</option>)}</select></label>
          <label>Ziel<select name="goal">{goals.map((g) => <option key={g}>{g}</option>)}</select></label>
          <label>Nachricht<textarea name="message" rows={3} maxLength={1000} /></label>
          {error && <p className="contact-error">{error}</p>}
          <Button variant="cinematic" size="lg" type="submit">Pilot anfragen</Button>
        </form>
      </aside>
    </div>
  );
}
