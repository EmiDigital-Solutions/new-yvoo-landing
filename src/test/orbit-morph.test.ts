import { describe, expect, it } from "vitest";
import { orbitMorph } from "@/components/yvoo/orbit-morph";

describe("Pixel assembly synchronized with verification levels", () => {
  it("adds pixels at each level before revealing the photograph", () => {
    expect(orbitMorph(0)).toEqual({ gather: .32, photo: 0, particles: 1 });
    expect(orbitMorph(1).gather).toBeCloseTo(.66);
    expect(orbitMorph(1).photo).toBe(0);
    expect(orbitMorph(2)).toEqual({ gather: 1, photo: 0, particles: 1 });
  });
  it("gathers the same particles before revealing the real product", () => {
    expect(orbitMorph(2.5)).toEqual({ gather: 1, photo: .5, particles: .5 });
    expect(orbitMorph(3)).toEqual({ gather: 1, photo: 1, particles: 0 });
  });
  it("restores the pixel part when scrolling back", () => {
    expect(orbitMorph(3).particles).toBe(0);
    expect(orbitMorph(1).gather).toBeLessThan(orbitMorph(2).gather);
    expect(orbitMorph(0)).toEqual({ gather: .32, photo: 0, particles: 1 });
  });
  it("shows the finished part without a morph for reduced motion", () => {
    expect(orbitMorph(0, true)).toEqual({ gather: 1, photo: 1, particles: 0 });
  });
});