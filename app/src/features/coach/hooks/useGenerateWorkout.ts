import { useCallback, useState } from "react";
import { resolveService } from "../../../core/composition";
import {
  buildDefaultGenerationRequest,
  EMPTY_PLAN_METADATA,
  generateWorkoutPlan,
  type WorkoutPlan,
  type WorkoutResult,
} from "../../workout-generation-pipeline";

export interface UseGenerateWorkoutOptions {
  readonly athleteId?: string;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  /** Called after a successful generation so the plan attaches to conversation. */
  readonly onPlanGenerated?: (plan: WorkoutPlan) => void;
}

export interface UseGenerateWorkoutResult {
  readonly generating: boolean;
  readonly plan: WorkoutPlan | null;
  readonly result: WorkoutResult | null;
  readonly error: string | null;
  readonly generateWorkout: () => Promise<WorkoutResult>;
  readonly clear: () => void;
}

/**
 * Coach Screen hook — requests Generate Workout through the pipeline.
 * No mock objects. Resolves WorkoutGenerationPipelineService from Composition Root.
 */
export function useGenerateWorkout(
  options: UseGenerateWorkoutOptions = {},
): UseGenerateWorkoutResult {
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setPlan(null);
    setResult(null);
    setError(null);
  }, []);

  const generateWorkout = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const service = resolveService("WorkoutGenerationPipelineService");
      const athleteId = options.athleteId ?? "athlete:1";
      const generationRequest = buildDefaultGenerationRequest({
        athleteId,
        conversationId: options.conversationId,
      });
      const pipelineResult = await generateWorkoutPlan({
        service,
        request: Object.freeze({
          id: `pipeline-req:coach:${Date.now()}`,
          athleteId,
          conversationId: options.conversationId ?? null,
          sessionId: options.sessionId ?? null,
          message: "Generate Workout",
          intent: "generate_workout",
          generationRequest,
          metadata: EMPTY_PLAN_METADATA,
          createdAt: new Date().toISOString(),
        }),
      });
      setResult(pipelineResult);
      setPlan(pipelineResult.plan);
      if (pipelineResult.plan) {
        // Prefer Composition Root coach conversation attachment when available.
        try {
          const coachConversation = resolveService("CoachConversationService");
          coachConversation.attachWorkoutPlan(pipelineResult.plan);
        } catch {
          // Composition may omit coach conversation in isolated tests.
        }
        options.onPlanGenerated?.(pipelineResult.plan);
      }
      if (!pipelineResult.success) {
        setError(pipelineResult.message);
      }
      return pipelineResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Workout generation failed";
      setError(message);
      setPlan(null);
      setResult(null);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [
    options.athleteId,
    options.conversationId,
    options.onPlanGenerated,
    options.sessionId,
  ]);

  return {
    generating,
    plan,
    result,
    error,
    generateWorkout,
    clear,
  };
}
