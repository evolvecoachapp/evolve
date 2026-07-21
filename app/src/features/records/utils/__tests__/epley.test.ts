import { estimateOneRMEpley } from "../epley";

describe("estimateOneRMEpley", () => {
  it("applies the Epley formula weight × (1 + reps / 30)", () => {
    // 100 × (1 + 5/30) = 100 × 1.1666… = 116.67
    expect(estimateOneRMEpley(100, 5)).toBe(116.67);
  });

  it("returns the load itself for a true single-rep set", () => {
    expect(estimateOneRMEpley(140, 1)).toBe(140);
  });

  it("returns 0 for non-positive or non-finite inputs", () => {
    expect(estimateOneRMEpley(0, 5)).toBe(0);
    expect(estimateOneRMEpley(100, 0)).toBe(0);
    expect(estimateOneRMEpley(-50, 5)).toBe(0);
    expect(estimateOneRMEpley(Number.NaN, 5)).toBe(0);
    expect(estimateOneRMEpley(100, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
