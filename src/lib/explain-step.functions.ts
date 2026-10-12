import { createServerFn } from "@tanstack/react-start";

const STEPS = [
  "Level 1 · Digital audit: the supplier uploads every document and proof; Atlas checks each for gaps, expiry and plausibility.",
  "Level 2 · Guided self-audit: the supplier runs a full audit with the auditor's checklist, guided step by step by Atlas.",
  "Level 3 · On-site verification: an independent YVOO auditor checks on site only what is still unproven.",
  "CAPA · Corrective actions: every finding becomes a tracked action; the supplier is released once actions are closed.",
];
const ROLES = ["Quality director", "Purchasing / CPO", "CEO", "CFO", "Supplier"];

/** Public, stateless explanation of one How-it-works step for a visitor role. */
export const explainStep = createServerFn({ method: "POST" })
  .inputValidator((input: { step: number; role: string }) => {
    const step = Math.trunc(Number(input?.step));
    if (!(step >= 0 && step < STEPS.length)) throw new Error("Invalid step");
    const role = ROLES.includes(input?.role) ? input.role : ROLES[0]!;
    return { step, role };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI is not configured." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        max_output_tokens: 600,
        instructions:
          "You explain YVOO's supplier verification. YVOO's 'DNA' is its core design: Atlas AI reads every proof, three verification levels set the depth, and a certified local expert checks only what remains unproven; evidence flows as one continuous strand from first search to one reusable verified supplier record. Write 2-3 short sentences in English, plain and concrete, for the given role: what this step does for them and how it continues the DNA strand. No invented numbers, no lists, no hype.",
        input: `Role: ${data.role}\nStep: ${STEPS[data.step]}`,
      }),
    });
    if (!res.ok || !res.body) {
      const msg = res.status === 429 ? "Too many requests, please try again shortly." : res.status === 402 ? "AI credits are used up." : "The explanation could not be generated.";
      return { ok: false as const, error: msg };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
        } catch { /* partial frame */ }
      }
    }
    return text.trim() ? { ok: true as const, text: text.trim() } : { ok: false as const, error: "No explanation returned." };
  });

export const EXPLAIN_ROLES = ROLES;
