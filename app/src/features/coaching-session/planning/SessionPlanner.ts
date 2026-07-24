import { SessionActionKinds } from "../models/SessionAction";
import {
  SessionDecisionKinds,
  type SessionDecision,
} from "../models/SessionDecision";
import { SessionConfidenceLevels } from "../models/SessionConfidence";
import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import {
  SessionRequestKinds,
  type SessionRequest,
} from "../models/SessionRequest";
import { freezeDecision } from "../utils/FreezeSessionState";

/**
 * Deterministic session planner — planning only, no AI.
 */
export class SessionPlanner {
  plan(input: {
    readonly request: SessionRequest;
    readonly decisionId: string;
    readonly createdAt: string;
  }): SessionDecision {
    const { request } = input;
    if (request.kind === SessionRequestKinds.START) {
      return freezeDecision({
        id: input.decisionId,
        kind: SessionDecisionKinds.START,
        nextAction: SessionActionKinds.START,
        confidence: Object.freeze({
          level: SessionConfidenceLevels.HIGH,
          score: 1,
          rationale: "Start session.",
        }),
        rationale: "Initialize coaching session lifecycle.",
        metadata: EMPTY_SESSION_METADATA,
        createdAt: input.createdAt,
      });
    }
    if (request.kind === SessionRequestKinds.CONTINUE) {
      return freezeDecision({
        id: input.decisionId,
        kind: SessionDecisionKinds.CONTINUE,
        nextAction: SessionActionKinds.CONTINUE,
        confidence: Object.freeze({
          level: SessionConfidenceLevels.HIGH,
          score: 0.9,
          rationale: "Continue session.",
        }),
        rationale: "Continue active coaching session.",
        metadata: EMPTY_SESSION_METADATA,
        createdAt: input.createdAt,
      });
    }
    if (request.kind === SessionRequestKinds.END) {
      return freezeDecision({
        id: input.decisionId,
        kind: SessionDecisionKinds.END,
        nextAction: SessionActionKinds.END,
        confidence: Object.freeze({
          level: SessionConfidenceLevels.HIGH,
          score: 1,
          rationale: "End session.",
        }),
        rationale: "Finalize coaching session.",
        metadata: EMPTY_SESSION_METADATA,
        createdAt: input.createdAt,
      });
    }
    return freezeDecision({
      id: input.decisionId,
      kind: SessionDecisionKinds.FAIL,
      nextAction: SessionActionKinds.SUMMARIZE,
      confidence: Object.freeze({
        level: SessionConfidenceLevels.LOW,
        score: 0.2,
        rationale: "Unsupported request kind for planning.",
      }),
      rationale: "No actionable session plan.",
      metadata: EMPTY_SESSION_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function createSessionPlanner(): SessionPlanner {
  return new SessionPlanner();
}
