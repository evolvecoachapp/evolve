/**
 * Workout Domain capabilities the agent may orchestrate (no domain logic here).
 */
export const WorkoutDomainCapabilities = Object.freeze({
  PROGRAM_GENERATION: "program_generation" as const,
  PROGRAMMING: "programming" as const,
  PROGRESSION: "progression" as const,
  TRAINING_ADAPTATION: "training_adaptation" as const,
  WORKOUT_ASSEMBLY: "workout_assembly" as const,
  EXERCISE_KNOWLEDGE: "exercise_knowledge" as const,
  DECISION_INTELLIGENCE: "decision_intelligence" as const,
});

export type WorkoutDomainCapability =
  (typeof WorkoutDomainCapabilities)[keyof typeof WorkoutDomainCapabilities];

export const ALL_WORKOUT_DOMAIN_CAPABILITIES: readonly WorkoutDomainCapability[] =
  Object.freeze(Object.values(WorkoutDomainCapabilities));
