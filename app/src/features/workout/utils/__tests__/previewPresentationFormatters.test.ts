import type { WorkoutPreviewSet } from "../../../training/application";
import {
  formatPreviewIntensity,
  formatPreviewSetLine,
  formatPreviewSetsSummary,
} from "../previewPresentationFormatters";

function set(partial: Partial<WorkoutPreviewSet> & Pick<WorkoutPreviewSet, "id">): WorkoutPreviewSet {
  return {
    setType: "working",
    setTypeLabel: "Working",
    reps: { min: 8, max: 12, label: "8–12" },
    intensity: { metric: "rpe", value: 8, label: "RPE 8" },
    restSeconds: 90,
    notes: null,
    ...partial,
  };
}

describe("previewPresentationFormatters", () => {
  it("formats a uniform working-set summary", () => {
    const sets = [
      set({ id: "1" }),
      set({ id: "2" }),
      set({ id: "3" }),
    ];
    expect(formatPreviewSetsSummary(sets)).toBe("3 × 8–12");
  });

  it("prefers intensity from prescription sets", () => {
    const sets = [
      set({
        id: "wu",
        setType: "warmup",
        setTypeLabel: "Warm-up",
        intensity: { metric: "rpe", value: 5, label: "RPE 5" },
      }),
      set({ id: "w1" }),
    ];
    expect(formatPreviewIntensity(sets)).toBe("RPE 8");
  });

  it("formats a set detail line", () => {
    expect(formatPreviewSetLine(set({ id: "1" }))).toBe("Working · 8–12 reps · RPE 8");
  });
});
