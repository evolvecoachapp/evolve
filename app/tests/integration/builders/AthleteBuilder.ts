import { createAthleteProfile } from "../../../src/features/athlete-context/testSupport/fixtures";
import type { AthleteGoalType } from "../../../src/features/athlete-context/models/AthleteGoal";
import type { EquipmentItem } from "../../../src/features/athlete-context/models/EquipmentProfile";
import type { InjuryEntry } from "../../../src/features/athlete-context/models/InjuryProfile";
import type { ExperienceLevel } from "../../../src/features/athlete-context/models/TrainingExperience";
import type {
  IntensityBias,
  PreferredSplit,
} from "../../../src/features/athlete-context/models/TrainingPreference";
import type { AthleteContext } from "../../../src/features/program-generation/models/WorkoutGenerationRequest";
import {
  AdvancedPowerliftingAthlete,
  BeginnerBodybuildingAthlete,
  BulkingAthlete,
  CuttingAthlete,
  FemaleStrengthAthlete,
  GeneralFitnessAthlete,
  HomeGymAthlete,
  HypertrophyFocusedAthlete,
  IntermediatePowerbuildingAthlete,
  StrengthFocusedAthlete,
} from "../fixtures/athletes";
import { INTEGRATION_FIXED_TIMESTAMP } from "../shared/constants";
import type { AthleteFixture } from "../shared/types";

type AthleteDraft = {
  id?: string;
  displayName?: string | null;
  ageYears?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: {
    primary?: AthleteGoalType;
    secondary?: AthleteGoalType | null;
    targetDate?: string | null;
  };
  experience?: {
    level?: ExperienceLevel;
    trainingStartedAt?: string | null;
    yearsTraining?: number | null;
  };
  availability?: {
    daysPerWeek?: number;
    sessionDurationMinutes?: number;
    preferredDays?: number[];
  };
  preference?: {
    preferredSplit?: PreferredSplit | null;
    prefersCompoundLifts?: boolean;
    intensityBias?: IntensityBias;
  };
  equipment?: {
    available?: EquipmentItem[];
    hasFullGymAccess?: boolean;
  };
  injuries?: {
    injuries?: InjuryEntry[];
  };
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Fluent builder for immutable AthleteContext / AthleteFixture values.
 *
 * Example:
 *   buildAthlete()
 *     .advanced()
 *     .powerlifting()
 *     .gym()
 *     .fourTrainingDays()
 *     .strengthFocus()
 *     .build()
 */
export class AthleteBuilder {
  private draft: AthleteDraft = {};
  private fixtureKey = "custom-athlete";
  private fixtureLabel = "Custom Athlete";

  fromFixture(fixture: AthleteFixture): this {
    const profile = fixture.athleteContext.profile;
    this.fixtureKey = fixture.key;
    this.fixtureLabel = fixture.label;
    this.draft = {
      id: profile.id,
      displayName: profile.displayName,
      ageYears: profile.ageYears,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      goal: {
        primary: profile.goal.primary,
        secondary: profile.goal.secondary,
        targetDate: profile.goal.targetDate,
      },
      experience: {
        level: profile.experience.level,
        trainingStartedAt: profile.experience.trainingStartedAt,
        yearsTraining: profile.experience.yearsTraining,
      },
      availability: {
        daysPerWeek: profile.availability.daysPerWeek,
        sessionDurationMinutes: profile.availability.sessionDurationMinutes,
        preferredDays: [...profile.availability.preferredDays],
      },
      preference: {
        preferredSplit: profile.preference.preferredSplit,
        prefersCompoundLifts: profile.preference.prefersCompoundLifts,
        intensityBias: profile.preference.intensityBias,
      },
      equipment: {
        available: [...profile.equipment.available],
        hasFullGymAccess: profile.equipment.hasFullGymAccess,
      },
      injuries: {
        injuries: [...profile.injuries.injuries],
      },
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    return this;
  }

  beginner(): this {
    return this.withExperience("beginner", 1, "2025-01-01T00:00:00.000Z");
  }

  intermediate(): this {
    return this.withExperience("intermediate", 4, "2022-01-01T00:00:00.000Z");
  }

  advanced(): this {
    return this.withExperience("advanced", 8, "2018-01-01T00:00:00.000Z");
  }

  private withExperience(
    level: ExperienceLevel,
    yearsTraining: number,
    trainingStartedAt: string,
  ): this {
    this.draft.experience = {
      level,
      yearsTraining,
      trainingStartedAt,
    };
    return this;
  }

  bodybuilding(): this {
    return this.withGoal("bodybuilding", "hypertrophy");
  }

  powerlifting(): this {
    return this.withGoal("powerlifting", "strength");
  }

  powerbuilding(): this {
    return this.withGoal("strength", "hypertrophy");
  }

  cutting(): this {
    return this.withGoal("fat_loss", "hypertrophy");
  }

  bulking(): this {
    return this.withGoal("hypertrophy", "strength");
  }

  generalFitness(): this {
    return this.withGoal("general_fitness", "endurance");
  }

  strengthFocus(): this {
    const secondary =
      this.draft.goal && this.draft.goal.secondary !== undefined
        ? this.draft.goal.secondary
        : null;
    return this.withGoal("strength", secondary);
  }

  hypertrophyFocus(): this {
    const secondary =
      this.draft.goal && this.draft.goal.secondary !== undefined
        ? this.draft.goal.secondary
        : null;
    return this.withGoal("hypertrophy", secondary);
  }

  withGoal(
    primary: AthleteGoalType,
    secondary: AthleteGoalType | null = null,
  ): this {
    this.draft.goal = { primary, secondary, targetDate: null };
    return this;
  }

  gym(): this {
    this.draft.equipment = {
      available: [
        "barbell",
        "dumbbell",
        "cable",
        "machine",
        "bodyweight",
      ],
      hasFullGymAccess: true,
    };
    return this;
  }

  homeGym(): this {
    this.draft.equipment = {
      available: [
        "dumbbell",
        "kettlebell",
        "resistance_band",
        "bodyweight",
      ],
      hasFullGymAccess: false,
    };
    return this;
  }

  threeTrainingDays(): this {
    return this.withAvailability(3, 45, [1, 3, 5]);
  }

  fourTrainingDays(): this {
    return this.withAvailability(4, 70, [1, 2, 4, 5]);
  }

  fiveTrainingDays(): this {
    return this.withAvailability(5, 60, [1, 2, 3, 5, 6]);
  }

  withAvailability(
    daysPerWeek: number,
    sessionDurationMinutes: number,
    preferredDays: readonly number[],
  ): this {
    this.draft.availability = {
      daysPerWeek,
      sessionDurationMinutes,
      preferredDays: [...preferredDays],
    };
    return this;
  }

  withSplit(preferredSplit: PreferredSplit): this {
    this.draft.preference = {
      preferredSplit,
      prefersCompoundLifts: this.draft.preference?.prefersCompoundLifts ?? true,
      intensityBias: this.draft.preference?.intensityBias ?? "moderate",
    };
    return this;
  }

  withIntensity(intensityBias: IntensityBias): this {
    this.draft.preference = {
      preferredSplit: this.draft.preference?.preferredSplit ?? null,
      prefersCompoundLifts: this.draft.preference?.prefersCompoundLifts ?? true,
      intensityBias,
    };
    return this;
  }

  withId(id: string): this {
    this.draft.id = id;
    return this;
  }

  withDisplayName(displayName: string): this {
    this.draft.displayName = displayName;
    this.fixtureLabel = displayName;
    return this;
  }

  withKey(key: string): this {
    this.fixtureKey = key;
    return this;
  }

  /** Build an immutable AthleteContext. */
  buildContext(): AthleteContext {
    const profile = createAthleteProfile(this.draft);
    return Object.freeze({
      profile,
      trainingAgeYears: profile.experience.yearsTraining,
      validation: Object.freeze({
        valid: true,
        issues: Object.freeze([] as const),
      }),
      capturedAt: INTEGRATION_FIXED_TIMESTAMP,
    });
  }

  /** Build an immutable AthleteFixture wrapping the context. */
  build(): AthleteFixture {
    return Object.freeze({
      key: this.fixtureKey,
      label: this.fixtureLabel,
      athleteContext: this.buildContext(),
    });
  }
}

export function buildAthlete(): AthleteBuilder {
  return new AthleteBuilder();
}

export function buildFromBeginnerBodybuilding(): AthleteBuilder {
  return buildAthlete().fromFixture(BeginnerBodybuildingAthlete);
}

export function buildFromAdvancedPowerlifting(): AthleteBuilder {
  return buildAthlete().fromFixture(AdvancedPowerliftingAthlete);
}

export function buildFromIntermediatePowerbuilding(): AthleteBuilder {
  return buildAthlete().fromFixture(IntermediatePowerbuildingAthlete);
}

export function buildFromHomeGym(): AthleteBuilder {
  return buildAthlete().fromFixture(HomeGymAthlete);
}

export function buildFromStrengthFocused(): AthleteBuilder {
  return buildAthlete().fromFixture(StrengthFocusedAthlete);
}

export function buildFromHypertrophyFocused(): AthleteBuilder {
  return buildAthlete().fromFixture(HypertrophyFocusedAthlete);
}

export function buildFromCutting(): AthleteBuilder {
  return buildAthlete().fromFixture(CuttingAthlete);
}

export function buildFromBulking(): AthleteBuilder {
  return buildAthlete().fromFixture(BulkingAthlete);
}

export function buildFromFemaleStrength(): AthleteBuilder {
  return buildAthlete().fromFixture(FemaleStrengthAthlete);
}

export function buildFromGeneralFitness(): AthleteBuilder {
  return buildAthlete().fromFixture(GeneralFitnessAthlete);
}
