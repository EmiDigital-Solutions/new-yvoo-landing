import { describe, expect, it } from "vitest";
import { AUDITOR_CHAPTER_STARTS, auditorChapterIndex, auditorChapterProgress, auditorOpportunities } from "@/components/yvoo/auditor-story";

describe("Auditor cinematic timeline", () => {
  it("enters each scene at its text boundary in both directions", () => {
    AUDITOR_CHAPTER_STARTS.forEach((start, i) => {
      expect(auditorChapterIndex(start)).toBe(i);
      if (i > 0) expect(auditorChapterIndex(start - .00001)).toBe(i - 1);
      expect(auditorChapterProgress(start, i)).toBe(0);
    });
  });
  it("preserves the supplied illustrative fees and durations", () => {
    expect(auditorOpportunities.map(({ days, fee }) => [days, fee])).toEqual([[2, "$900"], [2, "$800"], [3, "€1,800"], [3, "$2,850"]]);
  });
});