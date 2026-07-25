import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachSupervisorPort } from "../contracts/CoachSupervisorPort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import {
  DecisionInputKinds,
  type DecisionInput,
} from "../models/DecisionInput";
import {
  createDecisionEngineService,
  type DecisionEngineService,
} from "../services/DecisionEngineService";
import { freezeInput } from "../utils/FreezeDecisionState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createDecisionInput(
  overrides: Partial<DecisionInput> = {},
): DecisionInput {
  return freezeInput({
    id: overrides.id ?? "request:decision-engine:test",
    kind: overrides.kind ?? DecisionInputKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    decisionContext: overrides.decisionContext ?? null,
    decisions: Object.freeze([...(overrides.decisions ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_DECISION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestDecisionEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): DecisionEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createDecisionEngineService({
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    supervisorPort: withMocks ? createMockCoachSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
