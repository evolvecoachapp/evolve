import type {
  GeneratedTrainingProgram,
  ProgramGenerationRequest,
  ProgramGenerator,
  ProgramGeneratorPlanners,
} from "../engine";
import type { AthleteProfile } from "./AthleteProfile";

/**
 * Thin application-layer seam between the app and the deterministic Training
 * Engine.
 *
 * Responsibilities:
 * 1. Accept a complete `AthleteProfile`
 * 2. Map it to a valid `ProgramGenerationRequest`
 * 3. Invoke the injected `ProgramGenerator` with injected planners
 * 4. Return the `GeneratedTrainingProgram` unchanged
 *
 * Contains no planning, scoring, constraint, or progression logic. All
 * programming decisions remain inside the Training Engine. Depends only on
 * engine contracts (`ProgramGenerator`, `ProgramGeneratorPlanners`) via
 * constructor injection — never on React, UI, persistence, AI, or networking.
 */
export class TrainingGenerationService {
  private readonly programGenerator: ProgramGenerator;
  private readonly planners: ProgramGeneratorPlanners;

  constructor(programGenerator: ProgramGenerator, planners: ProgramGeneratorPlanners) {
    this.programGenerator = programGenerator;
    this.planners = planners;
  }

  /** Generate a full training program for the given athlete profile. */
  generate(profile: AthleteProfile): GeneratedTrainingProgram {
    const request = this.toGenerationRequest(profile);
    return this.programGenerator.generateProgram(request, this.planners);
  }

  /**
   * Mechanical field mapping from application input to engine request.
   * No defaults, inference, or programming decisions are applied here.
   */
  private toGenerationRequest(profile: AthleteProfile): ProgramGenerationRequest {
    return {
      name: profile.name,
      description: profile.description,
      goal: profile.goal,
      experienceLevel: profile.experienceLevel,
      durationWeeks: profile.durationWeeks,
      availableDaysPerWeek: profile.availableDaysPerWeek,
      availableEquipment: profile.availableEquipment,
      exerciseCatalogue: profile.exerciseCatalogue,
      preferredSplitType: profile.preferredSplitType,
      tags: profile.tags,
      excludedExerciseIds: profile.excludedExerciseIds,
    };
  }
}
