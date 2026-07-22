/**
 * Workout Generation Integration Testing Framework (Sprint 17.8)
 *
 * Architecture:
 *   WorkoutGenerationRequest
 *     → Program Generation Orchestrator
 *     → WorkoutGenerationResult
 *     → Integration Assertions
 *     → Golden Validation
 *
 * This package is testing infrastructure only.
 * It must not change production business logic.
 */

export * from "./shared";
export * from "./fixtures";
export * from "./builders";
export * from "./assertions";
export * from "./utils";
export * from "./snapshots";
export * from "./golden";
export * from "./scenarios";
