import { detectRecentPR } from "../detectRecentPR";
import { createWorkoutRecord } from "../../testSupport/fixtures";

describe("detectRecentPR", () => {
  const referenceDate = new Date("2026-07-21T12:00:00.000Z");

  it("returns null when no records exist", () => {
    expect(
      detectRecentPR(createWorkoutRecord({ lastRecordAt: null }), {
        referenceDate,
      }),
    ).toBeNull();
  });

  it("returns null when the last record is outside the window", () => {
    expect(
      detectRecentPR(
        createWorkoutRecord({ lastRecordAt: "2026-06-01T12:00:00.000Z" }),
        { referenceDate, windowDays: 14 },
      ),
    ).toBeNull();
  });

  it("emits a recent_pr insight inside the window", () => {
    const insight = detectRecentPR(
      createWorkoutRecord({ lastRecordAt: "2026-07-18T12:00:00.000Z" }),
      { referenceDate, windowDays: 14 },
    );
    expect(insight).not.toBeNull();
    expect(insight?.kind).toBe("recent_pr");
    expect(insight?.payload.ageDays).toBe(3);
    expect(insight?.confidence).toBeGreaterThan(0.4);
  });
});
