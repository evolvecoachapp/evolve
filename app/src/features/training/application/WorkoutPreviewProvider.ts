import type { AthleteProfile } from "./AthleteProfile";
import { TrainingGenerationService } from "./TrainingGenerationService";
import {
  WorkoutPreviewBuilder,
  createExerciseDisplayLookup,
  type WorkoutProgramPreview,
} from "./presentation";
import { createTrainingGenerationService } from "./fixtures/createTrainingGenerationService";

/**
 * Lightweight application adapter that turns an `AthleteProfile` into a
 * UI-ready `WorkoutProgramPreview`.
 *
 * Keeps generation + projection out of React: screens/hooks only consume
 * the returned preview models. Contains no planning logic, persistence,
 * AI, or networking. Does not modify the Training Engine.
 */
export class WorkoutPreviewProvider {
  private readonly generationService: TrainingGenerationService;

  constructor(generationService: TrainingGenerationService) {
    this.generationService = generationService;
  }

  /** Generate a program and project it into an immutable workout preview. */
  getPreview(profile: AthleteProfile): WorkoutProgramPreview {
    const generated = this.generationService.generate(profile);
    const builder = new WorkoutPreviewBuilder(
      createExerciseDisplayLookup(profile.exerciseCatalogue),
    );
    return builder.build(generated);
  }
}

/**
 * Composition helper for app/UI consumers.
 * Wires the deterministic engine via the existing fixture helper — no
 * planning decisions are introduced here.
 */
export function createWorkoutPreviewProvider(): WorkoutPreviewProvider {
  return new WorkoutPreviewProvider(createTrainingGenerationService());
}
