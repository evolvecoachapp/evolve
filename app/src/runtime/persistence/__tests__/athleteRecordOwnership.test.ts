import {
  isOwnedByAthlete,
  isRecordOwnedByAthlete,
} from "../AthleteRecordOwnership";

describe("AthleteRecordOwnership — Persistence Consistency Guard (Sprint 36.5)", () => {
  describe("isOwnedByAthlete", () => {
    it("is true when the payload's athleteId matches the expected athlete id", () => {
      expect(isOwnedByAthlete({ athleteId: "athlete:a" }, "athlete:a")).toBe(
        true,
      );
    });

    it("is false when the payload's athleteId differs from the expected athlete id", () => {
      expect(isOwnedByAthlete({ athleteId: "athlete:b" }, "athlete:a")).toBe(
        false,
      );
    });

    it("is false for an empty-string mismatch (never treats absence as a match)", () => {
      expect(isOwnedByAthlete({ athleteId: "" }, "athlete:a")).toBe(false);
    });
  });

  describe("isRecordOwnedByAthlete", () => {
    it("is true when the payload's athleteId matches the record's own key", () => {
      const record = Object.freeze({ id: "athlete:a" });
      expect(
        isRecordOwnedByAthlete(record, { athleteId: "athlete:a" }),
      ).toBe(true);
    });

    it("is false when the payload's athleteId disagrees with the record's key — the exact case a corrupted or hand-edited row would produce", () => {
      const record = Object.freeze({ id: "athlete:current-user" });
      expect(
        isRecordOwnedByAthlete(record, {
          athleteId: "athlete:previous-user",
        }),
      ).toBe(false);
    });
  });
});
