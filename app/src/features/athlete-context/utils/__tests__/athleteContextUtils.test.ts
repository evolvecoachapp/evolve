import { createAthleteProfile } from "../../testSupport/fixtures";
import { calculateTrainingAge } from "../calculateTrainingAge";
import { deepFreezeProfile } from "../deepFreezeProfile";
import { normalizeUnits } from "../normalizeUnits";
import { sanitizeAthleteProfile } from "../sanitizeAthleteProfile";

describe("athlete-context utilities", () => {
  describe("calculateTrainingAge", () => {
    it("prefers trainingStartedAt when available", () => {
      const age = calculateTrainingAge(
        {
          level: "intermediate",
          trainingStartedAt: "2022-07-22T00:00:00.000Z",
          yearsTraining: 99,
        },
        new Date("2026-07-22T00:00:00.000Z"),
      );

      expect(age).toBe(4);
    });

    it("falls back to yearsTraining", () => {
      expect(
        calculateTrainingAge({
          level: "beginner",
          trainingStartedAt: null,
          yearsTraining: 2.9,
        }),
      ).toBe(2);
    });

    it("returns null when unknown", () => {
      expect(
        calculateTrainingAge({
          level: "beginner",
          trainingStartedAt: null,
          yearsTraining: null,
        }),
      ).toBeNull();
    });
  });

  describe("normalizeUnits", () => {
    it("converts inches and pounds to cm/kg", () => {
      const result = normalizeUnits({
        height: 70,
        heightUnit: "in",
        weight: 180,
        weightUnit: "lb",
      });

      expect(result.heightCm).toBeCloseTo(177.8, 1);
      expect(result.weightKg).toBeCloseTo(81.65, 1);
    });

    it("passes through canonical units", () => {
      expect(
        normalizeUnits({
          height: 180,
          heightUnit: "cm",
          weight: 75,
          weightUnit: "kg",
        }),
      ).toEqual({
        heightCm: 180,
        weightKg: 75,
      });
    });
  });

  describe("sanitizeAthleteProfile", () => {
    it("trims strings, drops empty injuries, and dedupes equipment", () => {
      const sanitized = sanitizeAthleteProfile(
        createAthleteProfile({
          displayName: "  Ada  ",
          equipment: {
            available: Object.freeze(["barbell", "barbell", "dumbbell"]),
            hasFullGymAccess: true,
          },
          injuries: {
            injuries: Object.freeze([
              Object.freeze({
                id: "  ",
                bodyRegion: "knee",
                severity: "mild" as const,
                notes: "  ",
                active: true,
              }),
              Object.freeze({
                id: "inj-1",
                bodyRegion: "  shoulder  ",
                severity: "moderate" as const,
                notes: "  avoid overhead  ",
                active: true,
              }),
            ]),
          },
        }),
      );

      expect(sanitized.displayName).toBe("Ada");
      expect(sanitized.equipment.available).toEqual(["barbell", "dumbbell"]);
      expect(sanitized.injuries.injuries).toHaveLength(1);
      expect(sanitized.injuries.injuries[0]?.bodyRegion).toBe("shoulder");
      expect(sanitized.injuries.injuries[0]?.notes).toBe("avoid overhead");
    });
  });

  describe("deepFreezeProfile", () => {
    it("freezes nested profile objects", () => {
      const frozen = deepFreezeProfile(createAthleteProfile());

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.goal)).toBe(true);
      expect(Object.isFrozen(frozen.equipment.available)).toBe(true);
      expect(Object.isFrozen(frozen.availability.preferredDays)).toBe(true);
    });
  });
});
