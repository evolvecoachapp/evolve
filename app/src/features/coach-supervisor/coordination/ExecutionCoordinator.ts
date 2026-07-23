import type {
  CollaborationPort,
  CollaborationExecutionOutput,
} from "../contracts/CollaborationPort";
import type { CoordinationPlan } from "../models/CoordinationPlan";
import { validateExecutionConsistency } from "../validators/validateExecutionConsistency";

export class ExecutionCoordinator {
  constructor(private readonly collaborationPort: CollaborationPort) {}

  coordinate(input: {
    readonly plan: CoordinationPlan;
    readonly clock: () => string;
  }): CollaborationExecutionOutput & {
    readonly consistent: boolean;
  } {
    const output = this.collaborationPort.execute({
      plan: input.plan,
      clock: input.clock,
    });
    const consistency = validateExecutionConsistency({
      plan: input.plan,
      summaries: output.summaries,
    });
    return Object.freeze({
      ...output,
      consistent: consistency.valid,
    });
  }
}

export function createExecutionCoordinator(
  collaborationPort: CollaborationPort,
): ExecutionCoordinator {
  return new ExecutionCoordinator(collaborationPort);
}
