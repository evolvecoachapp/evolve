import {
  AdvancedPowerliftingAthlete,
  BeginnerBodybuildingAthlete,
  BulkingAthlete,
  CuttingAthlete,
  GeneralFitnessAthlete,
  IntermediatePowerbuildingAthlete,
} from "../fixtures";
import { buildWorkoutRequest } from "../builders";
import type { IntegrationScenario } from "../shared/types";

/**
 * Canonical end-to-end scenarios for the complete workout generation pipeline.
 */
export const INTEGRATION_SCENARIOS: readonly IntegrationScenario[] = Object.freeze([
  Object.freeze({
    id: "advanced-powerlifting",
    title: "Advanced Powerlifting",
    description:
      "Advanced powerlifting athlete through the complete generation pipeline.",
    athleteFixtureKey: AdvancedPowerliftingAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(AdvancedPowerliftingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withEquipment(["barbell", "dumbbell", "cable", "machine"])
        .withExplanations(true)
        .build(),
  }),
  Object.freeze({
    id: "beginner-bodybuilding",
    title: "Beginner Bodybuilding",
    description:
      "Beginner bodybuilding athlete through the complete generation pipeline.",
    athleteFixtureKey: BeginnerBodybuildingAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(BeginnerBodybuildingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withMaxDifficulty("beginner")
        .withExplanations(true)
        .build(),
  }),
  Object.freeze({
    id: "powerbuilding",
    title: "Powerbuilding",
    description:
      "Intermediate powerbuilding athlete through the complete generation pipeline.",
    athleteFixtureKey: IntermediatePowerbuildingAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(IntermediatePowerbuildingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withExplanations(true)
        .build(),
  }),
  Object.freeze({
    id: "cutting",
    title: "Cutting",
    description: "Cutting-phase athlete through the complete generation pipeline.",
    athleteFixtureKey: CuttingAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(CuttingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withExplanations(true)
        .build(),
  }),
  Object.freeze({
    id: "bulking",
    title: "Bulking",
    description: "Bulking-phase athlete through the complete generation pipeline.",
    athleteFixtureKey: BulkingAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(BulkingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withExplanations(true)
        .build(),
  }),
  Object.freeze({
    id: "general-fitness",
    title: "General Fitness",
    description:
      "General fitness athlete through the complete generation pipeline.",
    athleteFixtureKey: GeneralFitnessAthlete.key,
    buildRequest: () =>
      buildWorkoutRequest()
        .withAthlete(GeneralFitnessAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .withMaxDifficulty("beginner")
        .withExplanations(true)
        .build(),
  }),
]);

export function getScenario(id: string): IntegrationScenario {
  const scenario = INTEGRATION_SCENARIOS.find((entry) => entry.id === id);
  if (!scenario) {
    throw new Error(`Unknown integration scenario: ${id}`);
  }
  return scenario;
}
