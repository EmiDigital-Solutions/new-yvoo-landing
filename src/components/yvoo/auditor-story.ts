export const AUDITOR_CHAPTER_STARTS = [0, .105, .205, .305, .415, .555, .665, .775, .88] as const;
export const AUDITOR_INTRO_URL = "https://calendly.com/yvoo/demo-yvoo";

export const auditorChapters = [
  { name: "Your terms", title: ["Audit on your terms", "Get paid same day"], body: "The industries we serve demand the highest standards. So do we.", details: [
    ["By invitation only", "A partnership for experienced auditors in regulated industries."],
    ["Built for enterprise", "Automotive OEMs, aerospace suppliers, precision engineering, medical devices, chemical & pharma, energy & utilities."],
    ["Your independence", "Choose your schedule and workload. No exclusivity requirements."],
  ] },
  { name: "Auditing, reinvented", title: ["Auditing,", "reinvented"], body: "Work locally — assignments near you. Atlas AI handles documentation. You choose your schedule and workload.", details: [
    ["Work locally", "Constant travel, hotels, jet lag → Work locally — assignments near you."],
    ["Atlas AI handles documentation", "Manual reports, extensive paperwork → Atlas AI handles documentation."],
    ["Immediate payment", "Wait months for invoice payments → Payment released when you submit the report."],
    ["Your schedule and workload", "Inconsistent one-off assignments → You choose your schedule and workload."],
  ] },
  { name: "The difference", title: ["What changes when the", "platform works for you"], body: "You receive the assignment — fully organized before you start. The assignment appears in your app. Scope, checklist, supplier documents — everything is there.", details: [
    ["Assignment", "Rate, timeline, and deliverables are clear from the beginning. Accept or decline with one tap."],
    ["Preparation", "Everything you need for preparation is already structured and ready. Ready from day one. No back-and-forth."],
    ["On-site · Reporting · Payment", "No calls, no searching for missing documents."],
  ] },
  { name: "Your AI co-pilot", title: ["Your AI", "co-pilot"], body: "Point your phone at a machine — AI identifies it. Take a photo — AI categorizes it. Finish the audit — AI writes the report. You focus on what matters: your expertise.", details: [
    ["Equipment Recognition", "Camera scans machines. AI identifies manufacturer, model, and condition."],
    ["Live Documentation", "Photos are auto-categorized. Findings are auto-formatted. Reports are generated automatically."],
    ["Smart Templates", "Upload specifications. AI generates your audit framework automatically."],
    ["Immediate Payment", "Payment released when you submit the report. No invoicing required."],
  ] },
  { name: "Atlas Auditor View", title: ["Atlas AI", "Auditor View"], body: "Checklist. Evidence. Atlas AI. Report.", details: [
    ["Smart Templates", "Upload specifications and Atlas generates your audit framework automatically."],
    ["Enterprise tools", "Conduct audits with enterprise-grade tools and real-time AI guidance."],
    ["Accuracy", "AI identifies patterns and flags document control gaps in real-time."],
  ] },
  { name: "Payment", title: ["Simple. Transparent.", "Immediate"], body: "No invoicing. No waiting. No uncertainty. Report submitted → Payment released.", details: [
    ["01 Submit report", "Upload your completed audit report to the platform."],
    ["02 AI validates", "Instant quality check — no manual client approval needed (under 1 minute)."],
    ["03 Payment released", "Funds are auto-released to your bank account immediately."],
    ["04 Paid same day", "Money in your account the same business day."],
  ] },
  { name: "Opportunities", title: ["Real assignments", "Real fees"], body: "Examples based on recent assignments. Fees vary by standard, complexity, and region.", details: [
    ["Exclusive training", "Continuous professional development and certification support."],
    ["Global peer network", "Connect with auditors across industries and share best practices."],
    ["Standards updates", "Early access to regulatory changes and evolving industry requirements."],
    ["Integrity. Precision. Growth.", "We seek auditors who are curious, precise, and ethical. Join professionals who care about quality, not just paychecks. Every partner shapes the standard we set."],
  ] },
  { name: "The standard", title: ["We’re selective", "So are you"], body: "Integrity. Precision. Growth. Our selection process ensures every partner meets the standards regulated industries expect.", details: [
    ["Recognized certification", "CPA, CIA, VDA, or ISO Lead Auditor certification."],
    ["Enterprise experience", "5+ years of auditing experience with enterprise clients."],
    ["Verified record", "Clean professional record and verified references."],
    ["Liability insurance", "Valid professional liability insurance is required."],
  ] },
  { name: "Your partnership", title: ["See how it works", "No commitment"], body: "15-minute intro call. View real opportunities. Decide if it fits.", details: [
    ["Apply", "Online application with credentials and certifications. Review within 48 hours."],
    ["Verify", "Technical interview and comprehensive credential verification."],
    ["Match", "AI connects you with enterprise clients matched to your expertise."],
    ["Audit", "Conduct audits with enterprise-grade tools and real-time support."],
    ["Earn", "Payment released upon report submission. Transparent terms, no hidden fees."],
  ] },
];

export const auditorOpportunities = [
  { standard: "ISO 9001", industry: "Quality Management", location: "China", days: 2, fee: "$900" },
  { standard: "VDA 6.3", industry: "Process Audit", location: "India", days: 2, fee: "$800" },
  { standard: "IATF 16949", industry: "Automotive QMS", location: "Poland", days: 3, fee: "€1,800" },
  { standard: "AS9100", industry: "Aerospace QMS", location: "Detroit", days: 3, fee: "$2,850" },
];

export const auditorFaq = [
  ["How does payment work?", "Once your audit report is submitted and validated, payment is auto-released the same business day via direct bank transfer. There is no invoicing required on your end—the platform handles everything. You see the fee upfront before accepting any assignment."],
  ["How does YVOO differ from traditional audit firms?", "You work as an independent professional, not an employee. You see each assignment's fee and location upfront and choose what fits your schedule. Atlas AI handles documentation, so you spend more time auditing and less on admin. There are no exclusivity requirements—you decide your workload."],
  ["What types of clients are on the platform?", "Our client base includes automotive OEMs, aerospace manufacturers, medical device companies, and precision engineering firms. All clients are pre-vetted enterprises with established quality management systems seeking certified auditors for specific standards."],
  ["How are assignments matched to me?", "Our matching system considers your certifications, industry specialization, and location to surface relevant opportunities near you. You review each assignment's details—standard, location, fee—and accept or decline with no obligation."],
  ["What professional development support is provided?", "Partners have access to CPE credits, quarterly webinars on emerging standards (IATF updates, VDA revisions), and our auditor knowledge base. We invest in keeping our network current with evolving industry requirements."],
  ["What is the application and verification process?", "Step 1: Submit credentials and certifications online (10 minutes). Step 2: Background verification and reference checks (5–7 days). Step 3: Technical interview with our audit director (30 minutes). Step 4: Onboarding and platform training (2 hours). Total timeline: 7–10 business days."],
];

export const auditorTestimonials = [
  ["What sets the platform apart is client quality — manufacturers who understand the value of rigorous auditing.", "Senior Lead Auditor · VDA 6.3 · IATF 16949"],
  ["Full control over scheduling, paired with clients who respect professional standards — a clear improvement over traditional audit firms.", "Independent Lead Auditor · ISO 9001 · ISO 14001"],
  ["The vetting process is thorough — and that is exactly why the client engagements are exceptional.", "Certified Internal Auditor · CIA · IATF Specialist"],
];

export function auditorChapterIndex(progress: number) {
  let index = 0;
  AUDITOR_CHAPTER_STARTS.forEach((at, i) => { if (progress >= at) index = i; });
  return index;
}

export function auditorChapterProgress(progress: number, index: number) {
  const start = AUDITOR_CHAPTER_STARTS[index] ?? 0;
  const end = AUDITOR_CHAPTER_STARTS[index + 1] ?? 1;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

