import { expect, it } from "vitest";
import { dnaWithdrawal, evidenceLattice } from "@/components/yvoo/luminous-motion";

it("withdraws DNA gradually and restores it on reverse scroll", () => {
  expect(dnaWithdrawal(0.084)).toBe(0);
  expect(dnaWithdrawal(0.099)).toBeCloseTo(0.5);
  expect(dnaWithdrawal(0.114)).toBe(1);
  expect(dnaWithdrawal(0.084)).toBe(0);
});
it("keeps the reference constellation open instead of a closed lattice", () => {
  const { nodes, edges } = evidenceLattice();
  expect(edges.length).toBeLessThan(nodes.length);
  for (let i = 0; i < nodes.length; i++) expect(edges.filter(edge => edge.includes(i)).length).toBeLessThanOrEqual(2);
});