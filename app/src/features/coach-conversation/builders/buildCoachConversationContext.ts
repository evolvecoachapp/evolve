import type { SessionResult } from "../../coaching-session/models/SessionResult";
import type { CoachingSession as ExplainableCoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { PlanRestoreResult } from "../../plan-restore/models/PlanRestoreResult";
import type { TimelineResult } from "../../coach-timeline/models/TimelineResult";
import type { InsightAnalysisResult } from "../../proactive-insights/models/InsightAnalysisResult";
import type { WorkoutModificationResult } from "../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { CoachConversationContext } from "../models/CoachConversationContext";
import type { CoachConversationIntent } from "../models/CoachConversationIntent";
import type { CoachConversationRequest } from "../models/CoachConversationRequest";

export interface BuildCoachConversationContextInput {
  readonly id: string;
  readonly request: CoachConversationRequest;
  readonly intent: CoachConversationIntent;
  readonly sessionId: string | null;
  readonly workoutPlan: WorkoutPlan | null;
  readonly previousWorkoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly restore?: PlanRestoreResult | null;
  readonly timelineResult?: TimelineResult | null;
  readonly insightResult?: InsightAnalysisResult | null;
  readonly session: SessionResult | null;
  readonly explainableSession?: ExplainableCoachingSession | null;
  readonly memoryHints?: readonly string[];
  readonly createdAt: string;
}

export function buildCoachConversationContext(
  input: BuildCoachConversationContextInput,
): CoachConversationContext {
  const plan = input.workoutPlan;
  const recommendationTitles =
    plan?.recommendationPackage?.recommendations.map((item) => item.title) ??
    Object.freeze([]);
  const recoveryNotes = plan?.notes.recoveryNotes ?? Object.freeze([]);
  const progressionCue = plan?.progression.cue ?? null;

  return Object.freeze({
    id: input.id,
    request: input.request,
    intent: input.intent,
    sessionId: input.sessionId,
    conversationId: input.request.conversationId,
    athleteId: input.request.athleteId,
    workoutPlan: plan,
    previousWorkoutPlan: input.previousWorkoutPlan ?? null,
    modification: input.modification ?? null,
    restore: input.restore ?? null,
    timelineResult: input.timelineResult ?? null,
    insightResult: input.insightResult ?? null,
    session: input.session,
    explainableSession: input.explainableSession ?? null,
    recommendationTitles: Object.freeze([...recommendationTitles]),
    recoveryNotes: Object.freeze([...recoveryNotes]),
    progressionCue,
    memoryHints: Object.freeze([...(input.memoryHints ?? [])]),
    createdAt: input.createdAt,
  });
}
