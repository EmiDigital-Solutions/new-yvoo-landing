import { describe, expect, it } from "vitest";
import { homeOpeningMotion, homeSceneVisibility, homeChapterIndex, homeChapterPose, homeImageReveal, homeDnaFinalePresence, homeDnaGlobeMorph, homeOpeningGlobeMorph } from "@/components/yvoo/home-scene-timeline";

describe("Continuous opening globe to DNA", () => {
  it("starts as the same filament globe used in the finale", () => {
    expect(homeOpeningGlobeMorph(0)).toBe(1);
    expect(homeSceneVisibility(0)).toEqual({ dna: 0, surroundings: false });
  });

  it("shows only the DNA at the second chapter", () => {
    expect(homeOpeningGlobeMorph(1 / 23)).toBe(0);
    expect(homeSceneVisibility(1 / 23)).toEqual({ dna: 1, surroundings: false });
  });

  it("continuously unforms the globe into DNA and restores it on reverse scroll", () => {
    expect(homeOpeningGlobeMorph(.004)).toBe(1);
    expect(homeOpeningGlobeMorph(.018)).toBeCloseTo(.5);
    expect(homeOpeningGlobeMorph(.032)).toBe(0);
    expect(homeOpeningGlobeMorph(.018)).toBeCloseTo(.5);
    expect(homeOpeningGlobeMorph(0)).toBe(1);
  });

  it("keeps travel particles visible during the globe-to-DNA handoff", () => {
    expect(homeOpeningGlobeMorph(.019)).toBeGreaterThan(0);
    expect(homeSceneVisibility(0.019).dna).toBe(0);
    expect(homeOpeningMotion(0.019).motes).toBe(1);
  });

  it("arrives at the DNA before the second chapter settles", () => {
    expect(homeOpeningMotion(0).push).toBe(0);
    expect(homeOpeningMotion(0).arrival).toBe(0);
    expect(homeOpeningMotion(1 / 23).push).toBe(1);
    expect(homeOpeningMotion(1 / 23).arrival).toBe(1);
  });

  it("completes the nearby DNA arrival while its reveal is still finishing", () => {
    expect(homeOpeningMotion(0.03).arrival).toBe(1);
    expect(homeOpeningGlobeMorph(.03)).toBeLessThan(.02);
    expect(homeSceneVisibility(0.03).dna).toBeGreaterThan(0.9);
  });
});
import { homeConstellation, homeDnaUnravel, homeDnaDemoPresence } from "@/components/yvoo/home-scene-timeline";
describe("DNA to walkthrough bridge", () => {
  it("lights up network nodes while the final DNA fibres are still unravelling", () => {
    expect(homeDnaUnravel(.088)).toBe(0);
    expect(homeDnaUnravel(.106)).toBeGreaterThan(0);
    expect(homeDnaUnravel(.106)).toBeLessThan(1);
    expect(homeConstellation(.106).fade).toBeGreaterThan(0);
    expect(homeDnaUnravel(.114)).toBe(1);
  });
  it("holds the DNA fully visible for a long scroll stretch", () => {
    expect(homeSceneVisibility(0.09).dna).toBe(1);
  });
});

describe("DNA backdrop behind the Atlas demo", () => {
  it("keeps the strand faintly alive only inside the demo chapter", () => {
    expect(homeDnaDemoPresence(.61)).toBe(0);
    expect(homeDnaDemoPresence(.68)).toBeGreaterThan(.9);
    expect(homeDnaDemoPresence(.75)).toBe(0);
  });
  it("stays dark again once the result chapter begins", () => {
    expect(homeDnaDemoPresence(.76)).toBe(0);
    expect(homeDnaDemoPresence(.9)).toBe(0);
  });
});

describe("Shared cinematic score", () => {
  it("keeps DNA copy through the network and changes on entering the walkthrough", () => {
    expect(homeChapterIndex(.125)).toBe(1);
    expect(homeChapterIndex(.131)).toBe(2);
  });
  it("reaches the pilot and restores the previous scene on reverse scroll", () => {
    expect(homeChapterIndex(1)).toBe(11);
    expect(homeChapterIndex(.89)).toBe(10);
    expect(homeImageReveal(.915,.9)).toBe(1);
    expect(homeImageReveal(.88,.9)).toBe(0);
  });
  it("reveals typography from outline to solid and hides it outside its window", () => {
    expect(homeChapterPose(.019,1).solid).toBe(0);
    expect(homeChapterPose(.043,1).solid).toBe(1);
    expect(homeChapterPose(.14,1).opacity).toBe(0);
  });
});

describe("Living DNA finale", () => {
  it("forms the globe from DNA and unforms it when scrolling back", () => {
    expect(homeDnaGlobeMorph(.925)).toBe(0);
    expect(homeDnaGlobeMorph(.95)).toBeCloseTo(.5);
    expect(homeDnaGlobeMorph(.975)).toBe(1);
    expect(homeDnaGlobeMorph(1)).toBe(1);
    expect(homeDnaGlobeMorph(.925)).toBe(0);
  });
  it("returns only for the final pilot chapter and restores on reverse scroll", () => {
    expect(homeDnaFinalePresence(.89)).toBe(0);
    expect(homeDnaFinalePresence(.9)).toBe(0);
    expect(homeDnaFinalePresence(.9125)).toBeCloseTo(.5);
    expect(homeDnaFinalePresence(.925)).toBe(1);
    expect(homeDnaFinalePresence(1)).toBe(1);
    expect(homeDnaFinalePresence(.89)).toBe(0);
  });
});
