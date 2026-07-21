import { createAthleteProfile } from "../../testSupport/fixtures";
import { validateAge } from "../validateAge";
import { validateAthleteContext } from "../validateAthleteContext";
import { validateAvailability } from "../validateAvailability";
import { validateEquipment } from "../validateEquipment";
import { validateExperience } from "../validateExperience";
import { validateGoal } from "../validateGoal";
import { validateHeight } from "../validateHeight";
import { validateInjuries } from "../validateInjuries";
import { validateWeight } from "../validateWeight";

describe("athlete-context validators", () => {
  describe("validateAge", () => {
    it("allows null age", () => {
      expect(validateAge(null)).toEqual([]);
    });

    it("rejects out-of-range ages", () => {
      expect(validateAge(12)).toEqual([
        { field: "ageYears", code: "invalid_age" },
      ]);
      expect(validateAge(101)).toEqual([
        { field: "ageYears", code: "invalid_age" },
      ]);
    });
  });

  describe("validateHeight", () => {
    it("rejects invalid heights", () => {
      expect(validateHeight(90)).toEqual([
        { field: "heightCm", code: "invalid_height" },
      ]);
    });
  });

  describe("validateWeight", () => {
    it("rejects invalid weights", () => {
      expect(validateWeight(20)).toEqual([
        { field: "weightKg", code: "invalid_weight" },
      ]);
    });
  });

  describe("validateGoal", () => {
    it("rejects duplicate secondary goals", () => {
      expect(
        validateGoal({
          primary: "strength",
          secondary: "strength",
          targetDate: null,
        }),
      ).toEqual([{ field: "goal.secondary", code: "invalid_secondary_goal" }]);
    });

    it("rejects invalid target dates", () => {
      expect(
        validateGoal({
          primary: "hypertrophy",
          secondary: null,
          targetDate: "not-a-date",
        }),
      ).toEqual([
        { field: "goal.targetDate", code: "invalid_goal_target_date" },
      ]);
    });
  });

  describe("validateAvailability", () => {
    it("rejects invalid days and durations", () => {
      expect(
        validateAvailability({
          daysPerWeek: 0,
          sessionDurationMinutes: 10,
          preferredDays: Object.freeze([8]),
        }),
      ).toEqual([
        { field: "availability.daysPerWeek", code: "invalid_days_per_week" },
        {
          field: "availability.sessionDurationMinutes",
          code: "invalid_session_duration",
        },
        {
          field: "availability.preferredDays[0]",
          code: "invalid_preferred_day",
        },
      ]);
    });
  });

  describe("validateExperience", () => {
    it("rejects negative years training", () => {
      expect(
        validateExperience({
          level: "beginner",
          trainingStartedAt: null,
          yearsTraining: -1,
        }),
      ).toEqual([
        {
          field: "experience.yearsTraining",
          code: "invalid_years_training",
        },
      ]);
    });
  });

  describe("validateEquipment", () => {
    it("rejects unknown equipment items", () => {
      expect(
        validateEquipment({
          available: Object.freeze(["not-real" as "barbell"]),
          hasFullGymAccess: false,
        }),
      ).toEqual([
        {
          field: "equipment.available[0]",
          code: "invalid_equipment_item",
        },
      ]);
    });
  });

  describe("validateInjuries", () => {
    it("rejects empty injury identifiers and regions", () => {
      expect(
        validateInjuries({
          injuries: Object.freeze([
            Object.freeze({
              id: "  ",
              bodyRegion: "",
              severity: "mild" as const,
              notes: null,
              active: true,
            }),
          ]),
        }),
      ).toEqual([
        {
          field: "injuries.injuries[0].id",
          code: "invalid_injury_id",
        },
        {
          field: "injuries.injuries[0].bodyRegion",
          code: "invalid_injury_region",
        },
      ]);
    });
  });

  describe("validateAthleteContext", () => {
    it("returns valid for a complete profile", () => {
      const result = validateAthleteContext(createAthleteProfile());
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it("aggregates structured issues without throwing", () => {
      const result = validateAthleteContext(
        createAthleteProfile({
          id: "  ",
          ageYears: 9,
          heightCm: 50,
          weightKg: 10,
        }),
      );

      expect(result.valid).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          "missing_profile_id",
          "invalid_age",
          "invalid_height",
          "invalid_weight",
        ]),
      );
    });
  });
});
