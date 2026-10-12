import { describe, expect, it } from "vitest";
import { auditorJourneyFrame, auditorDigitalFrame } from "@/components/yvoo/auditor-journey";

describe("Auditor spatial handoff", () => {
  it("keeps both visual scenes present during travel without overlapping copy", () => {
    const departing = auditorJourneyFrame(.8, 0);
    const arriving = auditorJourneyFrame(.8, 1);
    expect(departing.visible).toBe(true);
    expect(arriving.visible).toBe(true);
    expect(departing.opacity).toBeGreaterThan(0);
    expect(arriving.opacity).toBeGreaterThan(0);
    expect(departing.textOpacity).toBe(0);
    expect(arriving.textOpacity).toBe(0);
    expect(departing.imageX).toBeLessThan(0);
    expect(arriving.imageX).toBeGreaterThan(0);
  });
  it("returns the same camera position on reverse scrolling", () => {
    const forward = [.1, .5, .85].map(p => auditorJourneyFrame(p, 0));
    const reverse = [.85, .5, .1].map(p => auditorJourneyFrame(p, 0)).reverse();
    expect(reverse).toEqual(forward);
  });
  it("disables camera travel when reduced motion is requested", () => {
    const frame = auditorJourneyFrame(.8, 0, true);
    expect(frame.imageScale).toBe(1);
    expect(frame.imageX).toBe(0);
    expect(frame.textX).toBe(0);
  });
});

describe("Continuous digital head journey", () => {
  it("starts as a head and becomes DNA in the next chapter", () => {
    expect(auditorDigitalFrame(0).dna).toBe(0);
    expect(auditorDigitalFrame(1).dna).toBe(1);
    expect(auditorDigitalFrame(.6).dna).toBeGreaterThan(0);
    expect(auditorDigitalFrame(.6).dna).toBeLessThan(1);
  });
  it("reverses the same morph and continues into connected scenes", () => {
    expect([0,.5,1,2,3,5].map(p => auditorDigitalFrame(p))).toEqual([5,3,2,1,.5,0].reverse().map(p => auditorDigitalFrame(p)));
    expect(auditorDigitalFrame(2.2).network).toBe(1);
    expect(auditorDigitalFrame(3.3).payment).toBe(1);
    expect(auditorDigitalFrame(5).globe).toBe(1);
  });
  it("holds the camera still for reduced motion", () => {
    expect(auditorDigitalFrame(3,true).cameraX).toBe(0);
    expect(auditorDigitalFrame(3,true).cameraZ).toBe(18);
  });
});