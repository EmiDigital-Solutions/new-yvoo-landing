export const AUDITOR_JOURNEY_CHAPTERS = ["Your terms", "Your freedom", "Your expertise", "Your payment", "Real fees", "Your partnership"] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** One connected object; scrolling reverses the exact same geometric transformation. */
export function auditorDigitalFrame(position: number, reduced = false) {
  return {
    dna: smooth((position - .22) / .78),
    network: smooth((position - 1.55) / .6),
    payment: smooth((position - 2.65) / .55),
    globe: smooth((position - 4.5) / .5),
    cameraZ: reduced ? 18 : 18 - Math.sin(clamp(position / 5) * Math.PI) * 4,
    cameraX: reduced ? 0 : Math.sin(position * .65) * 1.4,
  };
}

/** A shared reversible camera score; each scene owns a hold and a spatial handoff. */
export function auditorJourneyFrame(position: number, index: number, reduced = false) {
  const local = position - index;
  const arrival = smooth((local + .34) / .34);
  const departure = smooth((local - .66) / .34);
  const visible = local > -.34 && local < 1;
  const textArrival = smooth((local + .13) / .13);
  const textDeparture = smooth((local - .58) / .2);
  return {
    visible,
    opacity: visible ? 1 - smooth((local - .96) / .04) : 0,
    imageX: reduced ? 0 : (1 - arrival) * 65 - departure * 65 - clamp(local) * 4,
    imageScale: reduced ? 1 : 1.06 + (1 - arrival) * .6 + departure * .48 + clamp(local) * .08,
    imageY: reduced ? 0 : (1 - arrival) * 10 - departure * 8,
    textOpacity: visible ? textArrival * (1 - textDeparture) : 0,
    textX: 0,
    textY: reduced ? 0 : (1 - textArrival) * 40 - textDeparture * 50,
    textScale: reduced ? 1 : 1 + textDeparture * .16,
    progress: clamp(local),
    fill: reduced ? 1 : smooth((local + .16) / .15),
    tint: smooth((local + .55) / .5) * (1 - smooth((local - .55) / .5)),
  };
}