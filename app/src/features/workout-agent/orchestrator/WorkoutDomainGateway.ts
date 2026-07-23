import { createDecisionReport } from "../../../core/decision-intelligence/application";
import { queryExerciseKnowledge } from "../../exercise-kb/application";
import { generateWorkoutProgram } from "../../program-generation/application";
import { programExercises } from "../../programming/application";
import { generateProgression } from "../../progression/application";
import { previewAdaptations } from "../../training-adaptation/application";
import { assembleWorkout } from "../../workout-assembly/application";
import type { TrainingAdaptationRequest } from "../../training-adaptation/models/TrainingAdaptationRequest";
import type { TrainingAdaptationResult } from "../../training-adaptation/models/TrainingAdaptationResult";
import type { WorkoutIntent } from "../models/WorkoutIntent";
import type { WorkoutDomainCapability } from "../models/WorkoutDomainCapability";
import { WorkoutDomainCapabilities } from "../models/WorkoutDomainCapability";
import type { WorkoutDomainInvocation } from "../models/WorkoutDomainInvocation";
import {
  WorkoutDomainInvocationStatuses,
} from "../models/WorkoutDomainInvocation";
import type {
  WorkoutDomainPayloads,
  WorkoutDomainPorts,
} from "../models/WorkoutDomainPayloads";
import { DomainCapabilitySelector } from "../selectors/DomainCapabilitySelector";

export interface WorkoutDomainGatewayDeps {
  readonly ports?: WorkoutDomainPorts;
  readonly clock?: () => string;
  readonly capabilitySelector?: DomainCapabilitySelector;
}

/**
 * Orchestrates calls into existing workout domain engines.
 * No business logic — selects capabilities and forwards payloads to ports.
 */
export class WorkoutDomainGateway {
  private readonly ports: Required<
    Pick<
      WorkoutDomainPorts,
      | "generateWorkoutProgram"
      | "programExercises"
      | "generateProgression"
      | "previewAdaptations"
      | "assembleWorkout"
      | "queryExerciseKnowledge"
      | "createDecisionReport"
    >
  >;
  private readonly clock: () => string;
  private readonly capabilitySelector: DomainCapabilitySelector;

  constructor(deps: WorkoutDomainGatewayDeps = {}) {
    const ports = deps.ports ?? {};
    this.ports = {
      generateWorkoutProgram:
        ports.generateWorkoutProgram ?? generateWorkoutProgram,
      programExercises: ports.programExercises ?? programExercises,
      generateProgression: ports.generateProgression ?? generateProgression,
      previewAdaptations: ports.previewAdaptations ?? previewAdaptations,
      assembleWorkout: ports.assembleWorkout ?? assembleWorkout,
      queryExerciseKnowledge:
        ports.queryExerciseKnowledge ?? queryExerciseKnowledge,
      createDecisionReport:
        ports.createDecisionReport ??
        ((source) => createDecisionReport(source)),
    };
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.capabilitySelector =
      deps.capabilitySelector ?? new DomainCapabilitySelector();
  }

  /**
   * Deterministic capability selection for an intent (no invocation).
   */
  selectCapabilities(intent: WorkoutIntent): readonly WorkoutDomainCapability[] {
    return this.capabilitySelector.select(intent);
  }

  /**
   * Record selected capabilities without invoking domain engines.
   */
  planInvocations(
    intent: WorkoutIntent,
    contextId: string,
  ): readonly WorkoutDomainInvocation[] {
    const selected = this.selectCapabilities(intent);
    return Object.freeze(
      selected.map((capability, index) =>
        this.freezeInvocation({
          id: `domain:${contextId}:${index}:${capability}`,
          capability,
          status: WorkoutDomainInvocationStatuses.SELECTED,
          summary: `Selected ${capability} for intent ${intent}.`,
          resultRef: null,
          attributes: Object.freeze({ intent }),
          invokedAt: this.clock(),
        }),
      ),
    );
  }

  /**
   * Invoke Training Adaptation Engine (adaptWorkout path).
   */
  async invokeAdaptation(
    request: TrainingAdaptationRequest,
    contextId: string,
  ): Promise<{
    readonly result: TrainingAdaptationResult;
    readonly invocation: WorkoutDomainInvocation;
  }> {
    const result = await this.ports.previewAdaptations(request);
    return {
      result,
      invocation: this.freezeInvocation({
        id: `domain:${contextId}:adaptation`,
        capability: WorkoutDomainCapabilities.TRAINING_ADAPTATION,
        status: WorkoutDomainInvocationStatuses.INVOKED,
        summary: `Adaptation produced ${result.recommendations.length} recommendation(s).`,
        resultRef: result.requestId,
        attributes: Object.freeze({
          recommendationCount: String(result.recommendations.length),
          readinessScore: String(result.readiness.overallScore),
        }),
        invokedAt: this.clock(),
      }),
    };
  }

  /**
   * Invoke selected domain capabilities when matching payloads are present.
   * Missing payloads → skipped (no fabrication).
   */
  async invokeSelected(
    intent: WorkoutIntent,
    contextId: string,
    payloads: WorkoutDomainPayloads = {},
  ): Promise<readonly WorkoutDomainInvocation[]> {
    const selected = this.selectCapabilities(intent);
    const invocations: WorkoutDomainInvocation[] = [];

    for (let index = 0; index < selected.length; index += 1) {
      const capability = selected[index];
      const id = `domain:${contextId}:${index}:${capability}`;

      try {
        switch (capability) {
          case WorkoutDomainCapabilities.PROGRAM_GENERATION: {
            if (!payloads.generationRequest) {
              invocations.push(
                this.skipped(id, capability, "generationRequest"),
              );
              break;
            }
            const result = await this.ports.generateWorkoutProgram(
              payloads.generationRequest,
            );
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Program Generation invoked.",
                resultRef: result.requestId,
                attributes: Object.freeze({
                  issueCount: String(result.validationIssues.length),
                }),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.PROGRAMMING: {
            if (!payloads.programmingRequest) {
              invocations.push(
                this.skipped(id, capability, "programmingRequest"),
              );
              break;
            }
            const result = await this.ports.programExercises(
              payloads.programmingRequest,
            );
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Programming Engine invoked.",
                resultRef: result.requestId ?? null,
                attributes: Object.freeze({}),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.PROGRESSION: {
            if (!payloads.progressionRequest) {
              invocations.push(
                this.skipped(id, capability, "progressionRequest"),
              );
              break;
            }
            const result = await this.ports.generateProgression(
              payloads.progressionRequest,
            );
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Progression Engine invoked.",
                resultRef: result.requestId,
                attributes: Object.freeze({}),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.TRAINING_ADAPTATION: {
            if (!payloads.adaptationRequest) {
              invocations.push(
                this.skipped(id, capability, "adaptationRequest"),
              );
              break;
            }
            const { invocation } = await this.invokeAdaptation(
              payloads.adaptationRequest,
              contextId,
            );
            invocations.push(
              this.freezeInvocation({
                ...invocation,
                id,
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.WORKOUT_ASSEMBLY: {
            if (!payloads.assemblyRequest) {
              invocations.push(
                this.skipped(id, capability, "assemblyRequest"),
              );
              break;
            }
            const result = await this.ports.assembleWorkout(
              payloads.assemblyRequest,
            );
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Workout Assembly Engine invoked.",
                resultRef: result.requestId,
                attributes: Object.freeze({
                  sessionId: result.session.id,
                }),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.EXERCISE_KNOWLEDGE: {
            if (!payloads.includeExerciseKnowledge) {
              invocations.push(
                this.skipped(id, capability, "includeExerciseKnowledge"),
              );
              break;
            }
            const result = await this.ports.queryExerciseKnowledge();
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Exercise Knowledge Base queried.",
                resultRef: null,
                attributes: Object.freeze({
                  exerciseCount: String(result.exercises?.length ?? 0),
                }),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          case WorkoutDomainCapabilities.DECISION_INTELLIGENCE: {
            if (!payloads.decisionSource) {
              invocations.push(
                this.skipped(id, capability, "decisionSource"),
              );
              break;
            }
            const report = this.ports.createDecisionReport(
              payloads.decisionSource,
            );
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.INVOKED,
                summary: "Decision Intelligence report created.",
                resultRef: report.reportId,
                attributes: Object.freeze({}),
                invokedAt: this.clock(),
              }),
            );
            break;
          }
          default:
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: WorkoutDomainInvocationStatuses.SKIPPED,
                summary: "Unknown capability.",
                resultRef: null,
                attributes: Object.freeze({}),
                invokedAt: this.clock(),
              }),
            );
        }
      } catch (error) {
        invocations.push(
          this.freezeInvocation({
            id,
            capability,
            status: WorkoutDomainInvocationStatuses.FAILED,
            summary:
              error instanceof Error ? error.message : "Domain invocation failed.",
            resultRef: null,
            attributes: Object.freeze({}),
            invokedAt: this.clock(),
          }),
        );
      }
    }

    return Object.freeze(invocations);
  }

  private skipped(
    id: string,
    capability: WorkoutDomainCapability,
    missing: string,
  ): WorkoutDomainInvocation {
    return this.freezeInvocation({
      id,
      capability,
      status: WorkoutDomainInvocationStatuses.SKIPPED,
      summary: `Skipped ${capability}; missing ${missing}.`,
      resultRef: null,
      attributes: Object.freeze({ missing }),
      invokedAt: this.clock(),
    });
  }

  private freezeInvocation(
    invocation: WorkoutDomainInvocation,
  ): WorkoutDomainInvocation {
    return Object.freeze({
      ...invocation,
      attributes: Object.freeze({ ...invocation.attributes }),
    });
  }
}

export function createWorkoutDomainGateway(
  deps: WorkoutDomainGatewayDeps = {},
): WorkoutDomainGateway {
  return new WorkoutDomainGateway(deps);
}
